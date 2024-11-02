const GetMetadataRootNode = require("../../../../../../Runtime.Module/MetadataHelpers.layer/metadata-hierarchy-handler.lib/src/GetMetadataRootNode")

const ExtractNamespaceFromDependency = (dependency, metadataHierarchy) => {
    const rootDependency = GetMetadataRootNode(metadataHierarchy)
    try{
        const [ prefix, token ] = dependency.split("/")
        return token!='' 
            ? `${prefix}/${token}`
            : rootDependency.metadata.package.namespace

    } catch(e){
        return undefined
    }

}

module.exports = ExtractNamespaceFromDependency