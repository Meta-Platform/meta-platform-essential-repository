const ListLayers = require("./ListLayers")
const GetPackagesByLayer = require("./Commons/GetPackagesByLayer")

const ListPackages = async ({
    ECO_DIRPATH_INSTALL_DATA,
    REPOS_CONF_FILENAME_REPOS_DATA,
    REPOS_CONF_EXT_MODULE_DIR,
    REPOS_CONF_EXT_LAYER_DIR,
    REPOS_CONF_EXT_GROUP_DIR,
    REPOS_CONF_EXTLIST_PKG_TYPE
}) => {
    
    const listLayers = await ListLayers({
        ECO_DIRPATH_INSTALL_DATA,
        REPOS_CONF_FILENAME_REPOS_DATA,
        REPOS_CONF_EXT_MODULE_DIR,
        REPOS_CONF_EXT_LAYER_DIR
    })  

    const listPackages = listLayers
        .reduce(async (listPackagesPromise, { layerName, moduleName, namespaceRepo }) => {
            const listPackages = await listPackagesPromise;
            const listPackagesChunk = await GetPackagesByLayer({ 
                layerName,
                namespaceRepo, 
                moduleName,
                REPOS_CONF_EXT_LAYER_DIR,
                ECO_DIRPATH_INSTALL_DATA,
                REPOS_CONF_FILENAME_REPOS_DATA,
                REPOS_CONF_EXT_MODULE_DIR,
                REPOS_CONF_EXT_GROUP_DIR,
                REPOS_CONF_EXTLIST_PKG_TYPE
            
            })
            return [...listPackages, ...listPackagesChunk]
        }, Promise.resolve([]))

    return listPackages
}

module.exports = ListPackages