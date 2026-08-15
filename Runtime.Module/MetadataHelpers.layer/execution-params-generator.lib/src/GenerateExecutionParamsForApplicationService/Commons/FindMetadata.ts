const FindMetadata = (namespace: any, metadataHierarchy: any) => {
    if(namespace){
        const { dependencyList } = metadataHierarchy
        const { dependency:{metadata} } = dependencyList
            .find(({dependency:{metadata:{package: packageInfo}}}: any) => packageInfo.namespace === namespace)!
        return metadata
    }
    return undefined
}

module.exports = FindMetadata