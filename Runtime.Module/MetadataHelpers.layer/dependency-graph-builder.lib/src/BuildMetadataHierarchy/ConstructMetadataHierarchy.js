const ConstructMetadataDependencyList = require("./ConstructMetadataDependencyList")
const CreateLinkedMetadataGraph = require("./CreateLinkedMetadataGraph")

const Walk = (node) => [
    node,
    ...node.children ? node.children.flatMap((node) => Walk(node)) : []
]

const ConstructMetadataHierarchy = (rawMetadataTree) => {

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