import type { DependencyNode, MetadataHierarchy } from "../../../dependency-graph-builder.lib/types/MetadataHierarchy"


const GetNamespaceFromMetadata = (metadata: any) => {
    const { package: { namespace }} = metadata
    return namespace
}

const ExtractNamespaceAndPath = (metadataHierarchy: MetadataHierarchy) => {
    const { dependencyList } = metadataHierarchy
    return dependencyList.map(({ dependency }: DependencyNode) => ({
        namespace: GetNamespaceFromMetadata(dependency.metadata),
        path: dependency.path
    }))
}

module.exports = ExtractNamespaceAndPath