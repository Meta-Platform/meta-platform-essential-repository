const ConstructDependencyRawMetadataTreeRecursively = require("./ConstructDependencyRawMetadataTreeRecursively")
const ConstructMetadataHierarchy = require("./ConstructMetadataHierarchy")

const ReplaceStartupParams = (metadataHierarchy, startupParams) => {

    const _replaceItemStartupParams = (list, startupParams) => {
        return list.map(item => {
            if(item?.dependency?.metadata?.["startup-params"]){
                const itemReplaced = {
                    ...item,
                    dependency: {
                        ...item.dependency,
                        metadata: {
                            ...item.dependency.metadata,
                            ["startup-params"]:startupParams
                        }
                    }
                }
                return itemReplaced
            }
            return item
        })
    }

    const {
        dependencyList,
        linkedGraph
    } = metadataHierarchy

    return {
        dependencyList: _replaceItemStartupParams(dependencyList, startupParams),
        linkedGraph
    }
}

const BuildMetadataHierarchy = async ({
    startupParams,
    path,
    packageList,
    REPOS_CONF_EXT_GROUP_DIR,
    PKG_CONF_DIRNAME_METADATA
}) => {
    const rawMetadataTree = await ConstructDependencyRawMetadataTreeRecursively({
        path,
        packageList,
        REPOS_CONF_EXT_GROUP_DIR: REPOS_CONF_EXT_GROUP_DIR || "group",
        PKG_CONF_DIRNAME_METADATA: PKG_CONF_DIRNAME_METADATA || "metadata"
    })
    const metadataHierarchy = ConstructMetadataHierarchy(rawMetadataTree)

    if(startupParams){
        return ReplaceStartupParams(metadataHierarchy, startupParams)
    } 

    return metadataHierarchy
}

module.exports = BuildMetadataHierarchy