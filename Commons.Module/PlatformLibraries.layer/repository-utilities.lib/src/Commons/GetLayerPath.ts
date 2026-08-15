const { resolve } = require("path")

const GetModulePath = require("./GetModulePath")

const GetLayerPath = async ({
    layerName,
    namespaceRepo, 
    moduleName, 
    REPOS_CONF_EXT_LAYER_DIR,
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA,
    REPOS_CONF_EXT_MODULE_DIR
}: {
    layerName: string
    namespaceRepo: string
    moduleName: string
    REPOS_CONF_EXT_LAYER_DIR: string
    installDataDirPath: string
    REPOS_CONF_FILENAME_REPOS_DATA: string
    REPOS_CONF_EXT_MODULE_DIR: string
}) => {
    const modulePath = await GetModulePath({ 
        namespaceRepo, 
        moduleName,
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
        REPOS_CONF_EXT_MODULE_DIR
    })
    return resolve(modulePath, `${layerName}.${REPOS_CONF_EXT_LAYER_DIR}`)
}

module.exports = GetLayerPath