import type { DependencyNode, MetadataHierarchy } from "../../types/MetadataHierarchy"
import type { PackageEntry } from "../../../../../Commons.Module/PlatformLibraries.layer/repository-utilities.lib/src/Types"

const ConstructDependencyRawMetadataTreeRecursively = require("./ConstructDependencyRawMetadataTreeRecursively") as (params: any) => Promise<any>
const ConstructMetadataHierarchy = require("./ConstructMetadataHierarchy") as (rawMetadataTree: any) => MetadataHierarchy

const ReplaceStartupParams = (metadataHierarchy: MetadataHierarchy, startupParams: Record<string, any>): MetadataHierarchy => {

    const _replaceItemStartupParams = (list: DependencyNode[], startupParams: Record<string, any>): DependencyNode[] => {
        return list.map((item: DependencyNode) => {
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
}: {
    startupParams?: Record<string, any>
    path: string
    packageList: PackageEntry[]
    REPOS_CONF_EXT_GROUP_DIR?: string
    PKG_CONF_DIRNAME_METADATA?: string
}): Promise<MetadataHierarchy> => {
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
        // Guarda o objeto injetado (ecosystem-defaults) NA hierarquia. Ele é
        // persistido junto e relido pelos geradores de execution-params, que o
        // disponibilizam a TODO service-instance — assim os services pegam essas
        // vars do ecossistema em execução, sem declará-las no services.json nem os
        // hosts repassarem via boot.json.
        return { ...ReplaceStartupParams(metadataHierarchy, startupParams), ecosystemDefaults: startupParams }
    }

    return metadataHierarchy
}

module.exports = BuildMetadataHierarchy
module.exports.ReplaceStartupParams = ReplaceStartupParams