
const TryResolveDependencyPath = require("./TryResolveDependencyPath")

const ResolveDependenciesPathsByBoundParams = async ({
    packageList,
    boundParams,
    REPOS_CONF_EXT_GROUP_DIR
}) => {
    if(boundParams){
        const pathsRaw = await Promise.all(Object
        .values(boundParams)
        .map(async (namespace) => await TryResolveDependencyPath({ 
            packageList,
            dependency:namespace, 
            REPOS_CONF_EXT_GROUP_DIR
        })))
        const paths = pathsRaw.filter((path) => path)
        return paths
    }
    return []
}

module.exports = ResolveDependenciesPathsByBoundParams