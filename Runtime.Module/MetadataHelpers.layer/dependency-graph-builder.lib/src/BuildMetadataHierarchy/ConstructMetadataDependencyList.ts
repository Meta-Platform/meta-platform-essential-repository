import type { Dependency, DependencyNode } from "../../types/MetadataHierarchy"

const ComputeObjectHash = require("../../../../../Commons.Module/Utilities.layer/compute-object-hash.lib/src/ComputeObjectHash") as (object: unknown) => string

const ConstructMetadataDependencyList = (metadataNodeList: any[]): DependencyNode[] => {

    const listAllPaths = metadataNodeList.map(({ path }) => path)
    const listPaths = Array.from(new Set(listAllPaths))

    const _FindNode = (_path: string) => metadataNodeList.find(({path}) => path === _path)

    const _ConvertNodeToMetadata = (node: any): Dependency => {
        return Object.keys(node)
        .filter((property) => property !== "children")
        .reduce((acc: Dependency, property) => ({...acc, [property]: node[property]}), {})
    }

    return listPaths.map((path) => {
        const metadataNode = _FindNode(path)
        return {
            code: ComputeObjectHash(metadataNode),
            dependency:_ConvertNodeToMetadata(metadataNode)
        }
    }) 
    
}

module.exports = ConstructMetadataDependencyList