const CreateLinkedMetadataGraph = (rawGraph, listData) => {

    const _FindCodeByPath = (_path) => {
        const { code } = listData.find(({ dependency:{path} }) => path === _path)
        return code
    }
    
    const _MountNodeChildren = (children) => children?.length > 0
        ? children.reduce((acc, node)=> ({ ...acc, ..._MountNode(node) }), {})
        : {}

    const _MountNode = ({ path, children }) => ({ [ _FindCodeByPath(path) ]:_MountNodeChildren(children) })

    return _MountNode(rawGraph)
    
}

module.exports = CreateLinkedMetadataGraph