const ListValidDir = require("./ListValidDir")
const GetModulePath = require("./GetModulePath")

const GetLayerNamesByModule = async ({
    namespaceRepo, 
    moduleName,
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA,
    REPOS_CONF_EXT_MODULE_DIR,
    REPOS_CONF_EXT_LAYER_DIR
}: {
    namespaceRepo: string
    moduleName: string
    installDataDirPath: string
    REPOS_CONF_FILENAME_REPOS_DATA: string
    REPOS_CONF_EXT_MODULE_DIR: string
    REPOS_CONF_EXT_LAYER_DIR: string
}) => {
    const path = await GetModulePath({
        namespaceRepo, 
        moduleName,
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
        REPOS_CONF_EXT_MODULE_DIR
    })

    return ListValidDir.listName({ 
        path: path, 
        ext: REPOS_CONF_EXT_LAYER_DIR
    })
}

module.exports = GetLayerNamesByModule