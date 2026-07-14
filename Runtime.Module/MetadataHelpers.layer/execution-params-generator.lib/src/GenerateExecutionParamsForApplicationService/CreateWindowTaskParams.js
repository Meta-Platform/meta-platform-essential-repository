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
        // rootPath do package raiz (o próprio .desktopapp) para que a janela
        // possa usar o ícone do pacote (icon.svg na raiz). No modo loadURL o
        // conteúdo é servido via HTTP, então a raiz é o package da janela.
        const rootNode = GetMetadataRootNode(metadataHierarchy)
        return {
            objectLoaderType: ConvertTypeTaskParamsToObjectLoaderType(typeMetadata),
            staticParameters: {
                ...commonStaticParameters,
                url: resolvedUrl,
                rootPath: rootNode.path
            },
            ...boundParams ? { linkedParameters: RemapAllParams(boundParams) } : {},
            agentLinkRules: _BuildAgentLinkRules(boundParams)
        }
    }

    // Modo GUI-host: sem "url"/"file", mas com um spec "gui-host". A janela NÃO
    // aponta para um servidor HTTP — o processo principal do Electron compila o
    // webgui e hospeda os services por IPC (sem webservices). O spec "gui-host"
    // descreve o grafo de services a instanciar (genérico, por app); os
    // bound-params (handles de pacote) são resolvidos em linkedParameters e
    // lidos pelo desktop-window-instance loader para montar a config do Electron.
    // Os params escalares vêm resolvidos dos startup-params, agrupados em
    // "guiParams" (não espalhados, para o loader distinguir de handles).
    const guiHost = itemMetadata["gui-host"]
    if(!file && guiHost){
        const rootNode = GetMetadataRootNode(metadataHierarchy)
        const guiParams = {
            // Injeção do ecossistema em execução: o webgui hospedado por IPC
            // recebe as vars do ecosystem-defaults como BASE, sem o boot.json
            // repassá-las. Os params próprios da janela prevalecem por cima.
            ...(metadataHierarchy && metadataHierarchy.ecosystemDefaults ? metadataHierarchy.ecosystemDefaults : {}),
            ...ResolveMetadataParamsWithStartupParams({
                params: itemMetadata.params,
                metadataHierarchy
            })
        }
        return {
            objectLoaderType: ConvertTypeTaskParamsToObjectLoaderType(typeMetadata),
            staticParameters: {
                ...commonStaticParameters,
                rootPath: rootNode.path,
                guiHost,
                guiParams
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
