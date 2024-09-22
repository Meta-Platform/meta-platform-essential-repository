const { resolve } = require("path")

const GetModulePath = require("./GetModulePath")

const GetLayerPath = async ({ 
    layerName,
    namespaceRepo, 
    moduleName, 
    REPOS_CONF_EXT_LAYER_DIR,
    ECO_DIRPATH_INSTALL_DATA,
    REPOS_CONF_FILENAME_REPOS_DATA,
    REPOS_CONF_EXT_MODULE_DIR
}) => {
    const modulePath = await GetModulePath({ 
        namespaceRepo, 
        moduleName,
        ECO_DIRPATH_INSTALL_DATA,
        REPOS_CONF_FILENAME_REPOS_DATA,
        REPOS_CONF_EXT_MODULE_DIR
    })
    return resolve(modulePath, `${layerName}.${REPOS_CONF_EXT_LAYER_DIR}`)
}

module.exports = GetLayerPath