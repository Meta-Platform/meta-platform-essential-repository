import type { Dependency, DependencyNode, LinkedGraph, MetadataHierarchy } from "../../types/MetadataHierarchy"

/** A árvore crua, antes de virar lista + grafo: cada nó traz os filhos dentro. */
type RawMetadataNode = Dependency & { children?: RawMetadataNode[] }

const ConstructMetadataDependencyList = require("./ConstructMetadataDependencyList") as (nodes: RawMetadataNode[]) => DependencyNode[]
const CreateLinkedMetadataGraph = require("./CreateLinkedMetadataGraph") as (rawGraph: RawMetadataNode, listData: DependencyNode[]) => LinkedGraph

const Walk = (node: RawMetadataNode): RawMetadataNode[] => [
    node,
    ...node.children ? node.children.flatMap((node: RawMetadataNode) => Walk(node)) : []
]

const ConstructMetadataHierarchy = (rawMetadataTree: RawMetadataNode): MetadataHierarchy => {

    const metadataNodeList       = Walk(rawMetadataTree)
    const metadataDependencyList = ConstructMetadataDependencyList(metadataNodeList)
    const linkedMetadataGraph    = CreateLinkedMetadataGraph(rawMetadataTree, metadataDependencyList)

    const metadataHierarchy = {
        dependencyList: metadataDependencyList,
        linkedGraph:linkedMetadataGraph
    }
    return metadataHierarchy
}

module.exports = ConstructMetadataHierarchy