import type { MetadataHierarchy } from "../../dependency-graph-builder.lib/types/MetadataHierarchy"

const ExtractNamespaceAndPath = require("./Utils/ExtractNamespaceAndPath")

// Uma biblioteca de UI (`.uilib`) é um pacote front-end estrutural. Ela participa
// do mesmo grafo de dependências dos demais pacotes, mas recebe um handle
// especializado, com manifesto/aliases consumidos pelo WebInterfaceBuilder.
//
// O mapa é aberto de propósito: um sufixo novo aqui é um tipo de pacote novo no
// grafo, sem tocar no resto do gerador.
const UI_LIBRARY_SUFFIXES: Record<string, string> = {
    ".uilib": "ui-library"
}

const ResolveObjectLoaderType = (tag: any) => {
    const suffix = Object.keys(UI_LIBRARY_SUFFIXES).find((candidate: any) => String(tag).endsWith(candidate))
    return suffix ? UI_LIBRARY_SUFFIXES[suffix] : "nodejs-package"
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
