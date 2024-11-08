const ListRepositories = require("./ListRepositories")
const GetModuleNamesByRepo = require("./Commons/GetModuleNamesByRepo")

const ListModules = async ({
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA,
    REPOS_CONF_EXT_MODULE_DIR
}) => {
    const listRepositories = await ListRepositories({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
    })
    const listModules = await listRepositories
        .reduce(async (listModulesPromise, { namespace }) => {
            const listModules = await listModulesPromise;
            const listModuleNames = await GetModuleNamesByRepo({
                namespace,
                REPOS_CONF_EXT_MODULE_DIR,
                installDataDirPath,
                REPOS_CONF_FILENAME_REPOS_DATA
            })
            const listModulesChunk = listModuleNames.map((moduleName) => {
                return { moduleName, namespaceRepo: namespace }
            })
            return [...listModules, ...listModulesChunk]
        }, Promise.resolve([]))

    return listModules
}

module.exports = ListModules