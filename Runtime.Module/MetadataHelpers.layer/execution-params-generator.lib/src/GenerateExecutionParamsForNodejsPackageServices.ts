import type { MetadataHierarchy } from "../../dependency-graph-builder.lib/types/MetadataHierarchy"

const ExtractNamespaceAndPath = require("./Utils/ExtractNamespaceAndPath")

// Pacotes ESTRUTURAIS que participam do mesmo grafo de dependências dos demais,
// mas recebem um handle especializado em vez do handle genérico de package Node.js:
//
// - `.uilib`  — biblioteca de UI; manifesto/aliases consumidos pelo WebInterfaceBuilder.
// - `.wasmlib` — módulo WebAssembly; manifesto/binário instanciados pelo wasm-module loader.
//
// O mapa é aberto de propósito: um sufixo novo aqui é um tipo de pacote novo no
// grafo, sem tocar no resto do gerador.
const PACKAGE_TYPE_SUFFIXES: Record<string, string> = {
    ".uilib": "ui-library",
    ".wasmlib": "wasm-module"
}

const ResolveObjectLoaderType = (tag: any) => {
    const suffix = Object.keys(PACKAGE_TYPE_SUFFIXES).find((candidate: any) => String(tag).endsWith(candidate))
    return suffix ? PACKAGE_TYPE_SUFFIXES[suffix] : "nodejs-package"
}

const GenerateExecutionParamsForNodejsPackageServices = ({
    metadataHierarchy, 
    environmentPath,
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
}: {
    metadataHierarchy: MetadataHierarchy
    environmentPath: string
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES: any
}) => {
    const _RemapNamespaceToTag = ({ namespace, path }: { namespace: string, path: string }) => ({tag:namespace, path, environmentPath})
    const _ConvertParamsToLaunchTaskParams = ({
        tag,
        path,
        environmentPath
    }: {
        tag: string
        path: string
        environmentPath: string
    }) => {

        return { 
            objectLoaderType: ResolveObjectLoaderType(tag),
            staticParameters:{
                tag,
                path,
                environmentPath,
                EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
            },
            activationRules:{
                "&&": [
                    {
                        "property": "params.namespace",
                        "=": tag
                    },
                    {
                        "property": "status",
                        "=": "FINISHED"
                    }
                ]
            }
        }
    }

    return ExtractNamespaceAndPath(metadataHierarchy)
        .map(_RemapNamespaceToTag)
        .map(_ConvertParamsToLaunchTaskParams)
}

GenerateExecutionParamsForNodejsPackageServices.ResolveObjectLoaderType = ResolveObjectLoaderType

module.exports = GenerateExecutionParamsForNodejsPackageServices
