const ConstructDependencyRawMetadataTreeRecursively = require("./ConstructDependencyRawMetadataTreeRecursively")
const ConstructMetadataHierarchy = require("./ConstructMetadataHierarchy")

const ReplaceStartupParams = (metadataHierarchy, startupParams) => {

    const _replaceItemStartupParams = (list, startupParams) => {
        return list.map(item => {
            if(item?.dependency?.metadata?.["startup-params"]){
                // Merge por-nó: as vars injetadas (ecossistema) servem de BASE
                // e os startup-params próprios do nó (port/socket/serverName)
                // prevalecem por cima. Assim não apagamos os params específicos.
                const ownStartupParams = item.dependency.metadata["startup-params"]
                const itemReplaced = {
                    ...item,
                    dependency: {
                        ...item.dependency,
                        metadata: {
                            ...item.dependency.metadata,
                            ["startup-params"]:{ ...startupParams, ...ownStartupParams }
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
        // Fallback intencional (CFGEC-30): quando o ecossistema não fornece a
        // configuração, mantemos os defaults convencionais "group"/"metadata".
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
module.exports.ReplaceStartupParams = ReplaceStartupParams