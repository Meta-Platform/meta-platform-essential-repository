import type { PackageEntry } from "../../../../../Commons.Module/PlatformLibraries.layer/repository-utilities.lib/src/Types"

type ResolveParams = {
    packageList: PackageEntry[]
    dependency: string
    REPOS_CONF_EXT_GROUP_DIR: string
}

const ResolveDependencyPath = require("../ResolveDependencyPath") as (params: ResolveParams) => Promise<string>

const TryResolveDependencyPath = async ({
    packageList,
    dependency, 
    REPOS_CONF_EXT_GROUP_DIR
}: ResolveParams): Promise<string | undefined> => {
    try{
        return await ResolveDependencyPath({ 
            packageList,
            dependency, 
            REPOS_CONF_EXT_GROUP_DIR
        })
    }catch(e){
        return undefined
    }
}

module.exports = TryResolveDependencyPath