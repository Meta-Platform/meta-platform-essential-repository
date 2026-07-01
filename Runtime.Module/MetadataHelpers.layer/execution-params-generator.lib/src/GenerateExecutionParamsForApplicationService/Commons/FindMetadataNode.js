const FindMetadataNode = (namespace, metadataHierarchy) => {
    if(namespace){
        const { dependencyList } = metadataHierarchy
        const node = dependencyList
            .find(({dependency:{metadata:{package:packageMetadata}}}) => packageMetadata.namespace === namespace)
        return node ? node.dependency : undefined
    }
    return undefined
}

module.exports = FindMetadataNode
