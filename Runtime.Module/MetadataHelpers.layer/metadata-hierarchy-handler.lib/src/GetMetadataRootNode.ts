import type { Dependency, MetadataHierarchy } from "../../dependency-graph-builder.lib/types/MetadataHierarchy"

/** A raiz da hierarquia: o package que foi pedido, e não uma dependência dele.
 * É a primeira chave do grafo — a ordem de inserção guarda essa informação. */
const GetMetadataRootNode = (metadataHierarchy: MetadataHierarchy): Dependency => {
    const { dependencyList, linkedGraph } = metadataHierarchy
    const rootNodeCode = Object.keys(linkedGraph)[0]
    const { dependency } = dependencyList.find(({ code }) => code === rootNodeCode)!
    return dependency
}

module.exports = GetMetadataRootNode
