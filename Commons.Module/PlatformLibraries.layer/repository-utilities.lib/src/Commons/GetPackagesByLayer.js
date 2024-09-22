const { resolve } = require("path")
const ListValidDir = require("./ListValidDir")
const GetLayerPath = require("./GetLayerPath")

const GetPackages = async ({
    path,
    disableExtGroupScan, 
    parentGroup,
    REPOS_CONF_EXT_GROUP_DIR,
    REPOS_CONF_EXTLIST_PKG_TYPE
}={}) => {
    
    const listExtPackages = REPOS_CONF_EXTLIST_PKG_TYPE.split("|")

    const newPath = parentGroup ? resolve(path, `${parentGroup}.group`) : path

    const listDirs = await ListValidDir.listNameAndExt({ 
        path: newPath, 
        ext: [ 
            ...listExtPackages, 
            ... !disableExtGroupScan ? [REPOS_CONF_EXT_GROUP_DIR] : []
        ]
    })

    const listPackageNameAndExt = await listDirs.reduce(async (listPackageNameAndExtPromiseAcc, {name, ext}) => {
        const listPackageNameAndExtAcc = await listPackageNameAndExtPromiseAcc;
        if(ext !== REPOS_CONF_EXT_GROUP_DIR){
            return [
                ...listPackageNameAndExtAcc, 
                {
                    name, 
                    ext, 
                    ...(parentGroup ? {parentGroup} : {})
                }
            ]
        } else {
            const ret =  [
                ...listPackageNameAndExtAcc, 
                ...await GetPackages({
                        path: newPath,
                        disableExtGroupScan:true, 
                        parentGroup: name,
                        REPOS_CONF_EXT_GROUP_DIR,
                        REPOS_CONF_EXTLIST_PKG_TYPE
                    })]
            return ret
        }

    }, Promise.resolve([]))

    return listPackageNameAndExt
}

const GetPackagesByLayer = async ({ 
    layerName,
    namespaceRepo, 
    moduleName,
    REPOS_CONF_EXT_LAYER_DIR,
    ECO_DIRPATH_INSTALL_DATA,
    REPOS_CONF_FILENAME_REPOS_DATA,
    REPOS_CONF_EXT_MODULE_DIR,
    REPOS_CONF_EXT_GROUP_DIR,
    REPOS_CONF_EXTLIST_PKG_TYPE

}) => {
    const layerPath = await GetLayerPath({ 
        layerName,
        namespaceRepo, 
        moduleName, 
        REPOS_CONF_EXT_LAYER_DIR,
        ECO_DIRPATH_INSTALL_DATA,
        REPOS_CONF_FILENAME_REPOS_DATA,
        REPOS_CONF_EXT_MODULE_DIR
    })

    const listPackageNameAndExt = await GetPackages({
        path:layerPath,
        REPOS_CONF_EXT_GROUP_DIR,
        REPOS_CONF_EXTLIST_PKG_TYPE
    })

    return listPackageNameAndExt.map(({ name, ext, parentGroup }) => {
        return { 
            packageName:name, 
            ext, 
            ...(parentGroup ? {parentGroup} : {}), 
            layerName, 
            namespaceRepo, 
            moduleName,
            layerPath
        }
    })
}

module.exports = GetPackagesByLayer