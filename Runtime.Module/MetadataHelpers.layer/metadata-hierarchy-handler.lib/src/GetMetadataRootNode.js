const GetMetadataRootNode = (metadataHierarchy) => {
    const { dependencyList, linkedGraph } = metadataHierarchy
    const rootNodeCode = Object.keys(linkedGraph)[0]
    const { dependency } = dependencyList.find(({ code }) => code === rootNodeCode)
    return dependency
}

module.exports = GetMetadataRootNode