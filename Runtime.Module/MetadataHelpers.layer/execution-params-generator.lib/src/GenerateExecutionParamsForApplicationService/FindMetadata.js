const FindMetadata = (namespace, metadataHierarchy) => {
    if(namespace){
        const { dependencyList } = metadataHierarchy
        const { dependency:{metadata} } = dependencyList
            .find(({dependency:{metadata:{package}}}) => package.namespace === namespace)
        return metadata
    }
    return undefined
}

module.exports = FindMetadata