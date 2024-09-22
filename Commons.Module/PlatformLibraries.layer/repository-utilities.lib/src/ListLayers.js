const ListModules = require("./ListModules")
const GetLayerNamesByModule = require("./Commons/GetLayerNamesByModule")

const ListLayers = async ({
    ECO_DIRPATH_INSTALL_DATA,
    REPOS_CONF_FILENAME_REPOS_DATA,
    REPOS_CONF_EXT_MODULE_DIR,
    REPOS_CONF_EXT_LAYER_DIR
}) => {
    const listModules = await ListModules({
        ECO_DIRPATH_INSTALL_DATA,
        REPOS_CONF_FILENAME_REPOS_DATA,
        REPOS_CONF_EXT_MODULE_DIR
    })

    const listLayers = listModules.reduce(async (listLayersPromise, { moduleName, namespaceRepo }) => {
        const listLayers = await listLayersPromise;
        const listLayersNames = await GetLayerNamesByModule({ 
            namespaceRepo, 
            moduleName,
            ECO_DIRPATH_INSTALL_DATA,
            REPOS_CONF_FILENAME_REPOS_DATA,
            REPOS_CONF_EXT_MODULE_DIR,
            REPOS_CONF_EXT_LAYER_DIR
        })
        const listLayersChunk = listLayersNames.map((layerName) => {
            return { layerName, moduleName, namespaceRepo }
        })
        return [...listLayers, ...listLayersChunk]
    }, Promise.resolve([]))

    return listLayers
}

module.exports = ListLayers