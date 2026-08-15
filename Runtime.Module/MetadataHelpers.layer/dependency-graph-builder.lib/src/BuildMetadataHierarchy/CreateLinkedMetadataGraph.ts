import type { DependencyNode, LinkedGraph } from "../../types/MetadataHierarchy"

const CreateLinkedMetadataGraph = (rawGraph: any, listData: DependencyNode[]): LinkedGraph => {

    const _FindCodeByPath = (_path: string): string => {
        const { code } = listData.find(({ dependency }) => dependency.path === _path)!
        return code
    }
    
    const _MountNodeChildren = (children: any[]): LinkedGraph => children?.length > 0
        ? children.reduce((acc: LinkedGraph, node: any)=> ({ ...acc, ..._MountNode(node) }), {})
        : {}

    const _MountNode = ({ path, children }: any): LinkedGraph => ({ [ _FindCodeByPath(path) ]:_MountNodeChildren(children) })

    return _MountNode(rawGraph)
    
}

module.exports = CreateLinkedMetadataGraph