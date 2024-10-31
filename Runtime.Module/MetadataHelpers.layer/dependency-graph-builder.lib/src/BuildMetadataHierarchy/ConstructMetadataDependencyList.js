const ComputeObjectHash = require("../../../../../Commons.Module/Utilities.layer/compute-object-hash.lib/src/ComputeObjectHash")

const ConstructMetadataDependencyList = (metadataNodeList) => {

    const listAllPaths = metadataNodeList.map(({ path }) => path)
    const listPaths = Array.from(new Set(listAllPaths))

    const _FindNode = (_path) => metadataNodeList.find(({path}) => path === _path)

    const _ConvertNodeToMetadata = (node) => {
        return Object.keys(node)
        .filter((property) => property !== "children")
        .reduce((acc, property) => ({...acc, [property]: node[property]}), {})
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