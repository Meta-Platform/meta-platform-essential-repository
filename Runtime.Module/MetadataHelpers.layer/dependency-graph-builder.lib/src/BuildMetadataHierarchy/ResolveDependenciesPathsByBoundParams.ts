import type { PackageEntry } from "../../../../../Commons.Module/PlatformLibraries.layer/repository-utilities.lib/src/Types"


const TryResolveDependencyPath = require("./TryResolveDependencyPath") as (params: { packageList: PackageEntry[], dependency: string, REPOS_CONF_EXT_GROUP_DIR: string }) => Promise<string | undefined>

const ResolveDependenciesPathsByBoundParams = async ({
    packageList,
    boundParams,
    REPOS_CONF_EXT_GROUP_DIR
}: {
    packageList: PackageEntry[]
    boundParams?: Record<string, string>
    REPOS_CONF_EXT_GROUP_DIR: string
}): Promise<string[]> => {
    if(boundParams){
        const pathsRaw = await Promise.all(Object
        .values(boundParams)
        .map(async (namespace: string) => await TryResolveDependencyPath({ 
            packageList,
            dependency:namespace, 
            REPOS_CONF_EXT_GROUP_DIR
        })))
        const paths = pathsRaw.filter((path) => path) as string[]
        return paths
    }
    return []
}

module.exports = ResolveDependenciesPathsByBoundParams