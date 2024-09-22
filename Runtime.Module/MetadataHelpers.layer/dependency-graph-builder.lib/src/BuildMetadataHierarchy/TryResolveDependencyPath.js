const ResolveDependencyPath = require("../ResolveDependencyPath")

const TryResolveDependencyPath = async ({
    packageList,
    dependency, 
    REPOS_CONF_EXT_GROUP_DIR
}) => {
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