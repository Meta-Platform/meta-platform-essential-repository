import type { LayerEntry, ModuleEntry } from "./Types"

const ListModules = require("./ListModules") as (params: any) => Promise<ModuleEntry[]>
const GetLayerNamesByModule = require("./Commons/GetLayerNamesByModule") as (params: any) => Promise<string[]>

const ListLayers = async ({
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA,
    REPOS_CONF_EXT_MODULE_DIR,
    REPOS_CONF_EXT_LAYER_DIR
}: {
    installDataDirPath: string
    REPOS_CONF_FILENAME_REPOS_DATA: string
    REPOS_CONF_EXT_MODULE_DIR: string
    REPOS_CONF_EXT_LAYER_DIR: string
}): Promise<LayerEntry[]> => {
    const listModules = await ListModules({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
        REPOS_CONF_EXT_MODULE_DIR
    })

    const listLayers = listModules.reduce(async (listLayersPromise: Promise<LayerEntry[]>, { moduleName, namespaceRepo }) => {
        const listLayers = await listLayersPromise;
        const listLayersNames = await GetLayerNamesByModule({ 
            namespaceRepo, 
            moduleName,
            installDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA,
            REPOS_CONF_EXT_MODULE_DIR,
            REPOS_CONF_EXT_LAYER_DIR
        })
        const listLayersChunk = listLayersNames.map((layerName: string) => {
            return { layerName, moduleName, namespaceRepo }
        })
        return [...listLayers, ...listLayersChunk]
    }, Promise.resolve([]))

    return listLayers
}

module.exports = ListLayers