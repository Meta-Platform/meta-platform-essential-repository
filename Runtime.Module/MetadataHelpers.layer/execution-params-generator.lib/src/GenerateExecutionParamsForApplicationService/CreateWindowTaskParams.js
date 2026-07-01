const GetMetadataRootNode                     = require("../../../../../Runtime.Module/MetadataHelpers.layer/metadata-hierarchy-handler.lib/src/GetMetadataRootNode")

const ExtractNamespaceFromDependency          = require("./Commons/ExtractNamespaceFromDependency")
const FindMetadataNode                        = require("./Commons/FindMetadataNode")
const ConvertTypeTaskParamsToObjectLoaderType = require("./Commons/ConvertTypeTaskParamsToObjectLoaderType")
const ExtractNamespaceListByBoundParams       = require("./Commons/ExtractNamespaceListByBoundParams")
const RemapAllParams                          = require("./Commons/RemapAllParams")
const ResolveMetadataParamsWithStartupParams  = require("./Commons/ResolveMetadataParamsWithStartupParams")

// A janela só ativa quando os serviços de instância aos quais está ligada
// (ex.: @@/server-service do webapp) estiverem ACTIVE.
const _BuildAgentLinkRules = (boundParams) => {
    const namespaceList = boundParams ? ExtractNamespaceListByBoundParams(boundParams) : []
    return namespaceList.map((namespace) => ({
        referenceName: namespace,
        requirement: {
            "&&": [
                { "property": "params.tag", "=": namespace },
                { "property": "status", "=": "ACTIVE" }
            ]
        }
    }))
}

const _ResolveContentPackage = ({ dependency, metadataHierarchy }) => {
    if(dependency){
        const namespace = ExtractNamespaceFromDependency(dependency, metadataHierarchy)
        const node = FindMetadataNode(namespace, metadataHierarchy)
        if(!node){
            throw `A dependencia ${dependency} não foi encontrada`
        }
        return { namespace, rootPath: node.path }
    }
    const rootNode = GetMetadataRootNode(metadataHierarchy)
    return {
        namespace: rootNode.metadata.package.namespace,
        rootPath: rootNode.path
    }
}

const CreateWindowTaskParams = ({
    typeMetadata,
    itemMetadata,
    metadataHierarchy
}) => {
    const { url, dependency, file, title, width, height } = itemMetadata
    const boundParams = itemMetadata["bound-params"]

    const commonStaticParameters = {
        ...title  !== undefined ? { title }  : {},
        ...width  !== undefined ? { width }  : {},
        ...height !== undefined ? { height } : {}
    }

    // Modo loadURL: a janela aponta para uma aplicação web local (ex.: o webapp
    // que sobe junto, no mesmo package). É o modo usado quando o .desktopapp
    // combina services/endpoints (backend + webgui) com a janela.
    if(url){
        const { url: resolvedUrl } = ResolveMetadataParamsWithStartupParams({
            params: { url },
            metadataHierarchy
        })
        return {
            objectLoaderType: ConvertTypeTaskParamsToObjectLoaderType(typeMetadata),
            staticParameters: {
                ...commonStaticParameters,
                url: resolvedUrl
            },
            ...boundParams ? { linkedParameters: RemapAllParams(boundParams) } : {},
            agentLinkRules: _BuildAgentLinkRules(boundParams)
        }
    }

    // Modo loadFile: a janela carrega um HTML local do package indicado por
    // "dependency" (ou do próprio .desktopapp, se omitido).
    if(!file){
        throw `Uma janela de um package .desktopapp precisa declarar "url" ou "file"`
    }
    const { namespace, rootPath } = _ResolveContentPackage({ dependency, metadataHierarchy })
    return {
        objectLoaderType: ConvertTypeTaskParamsToObjectLoaderType(typeMetadata),
        staticParameters: {
            ...commonStaticParameters,
            file,
            namespace,
            rootPath
        }
    }
}

module.exports = CreateWindowTaskParams
