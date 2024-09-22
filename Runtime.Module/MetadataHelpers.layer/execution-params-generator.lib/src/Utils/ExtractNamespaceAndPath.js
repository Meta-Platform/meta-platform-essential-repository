
const GetNamespaceFromMetadata = (metadata) => {
    const { package: { namespace }} = metadata
    return namespace
}

const ExtractNamespaceAndPath = (metadataHierarchy) => {
    const { dependencyList } = metadataHierarchy
    return dependencyList.map(({ dependency }) => ({
        namespace: GetNamespaceFromMetadata(dependency.metadata),
        path: dependency.path
    }))
}

module.exports = ExtractNamespaceAndPath