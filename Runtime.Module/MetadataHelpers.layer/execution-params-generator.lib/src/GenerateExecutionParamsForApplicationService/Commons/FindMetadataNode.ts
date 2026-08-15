const FindMetadataNode = (namespace: any, metadataHierarchy: any) => {
    if(namespace){
        const { dependencyList } = metadataHierarchy
        const node = dependencyList
            .find(({dependency:{metadata:{package:packageMetadata}}}: any) => packageMetadata.namespace === namespace)
        return node ? node.dependency : undefined
    }
    return undefined
}

module.exports = FindMetadataNode
