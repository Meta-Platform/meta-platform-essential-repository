const ExtractNamespaceAndPath = require("./Utils/ExtractNamespaceAndPath")

// Uma biblioteca de UI (`.uilib`) é um pacote front-end estrutural. Ela participa
// do mesmo grafo de dependências dos demais pacotes, mas recebe um handle
// especializado, com manifesto/aliases consumidos pelo WebInterfaceBuilder.
//
// O mapa é aberto de propósito: um sufixo novo aqui é um tipo de pacote novo no
// grafo, sem tocar no resto do gerador.
const UI_LIBRARY_SUFFIXES = {
    ".uilib": "ui-library"
}

const ResolveObjectLoaderType = (tag) => {
    const suffix = Object.keys(UI_LIBRARY_SUFFIXES).find((candidate) => String(tag).endsWith(candidate))
    return suffix ? UI_LIBRARY_SUFFIXES[suffix] : "nodejs-package"
}

const GenerateExecutionParamsForNodejsPackageServices = ({
    metadataHierarchy, 
    environmentPath,
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
}) => {
    const _RemapNamespaceToTag = ({ namespace, path }) => ({tag:namespace, path, environmentPath})
    const _ConvertParamsToLaunchTaskParams = ({
        tag,
        path,
        environmentPath
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
