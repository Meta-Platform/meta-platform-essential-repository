const ExtractNamespaceAndPath = require("./Utils/ExtractNamespaceAndPath")

// Uma biblioteca de UI (`.uilib`) é um pacote front-end estrutural. Ela participa
// do mesmo grafo de dependências dos demais pacotes, mas recebe um handle
// especializado, com manifesto/aliases consumidos pelo WebInterfaceBuilder.
//
// `.icomponents` é o nome antigo do mesmo tipo, e `webgui-library` o nome antigo
// do mesmo loader. Ficam aqui durante a janela de compatibilidade: a mudança
// atravessa três repositórios git independentes, cada um chegando ao ecossistema
// por um `repo update` separado — sem a janela, o estado intermediário entre os
// updates seria quebrado em vez de funcional.
const UI_LIBRARY_SUFFIXES = {
    ".uilib"      : "ui-library",
    ".icomponents": "webgui-library"
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
