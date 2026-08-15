import type { ModuleEntry, RepositoryEntry } from "./Types"

const ListRepositories = require("./ListRepositories") as (params: { installDataDirPath: string, REPOS_CONF_FILENAME_REPOS_DATA: string }) => Promise<RepositoryEntry[]>
const GetModuleNamesByRepo = require("./Commons/GetModuleNamesByRepo") as (params: any) => Promise<string[]>

const ListModules = async ({
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA,
    REPOS_CONF_EXT_MODULE_DIR
}: {
    installDataDirPath: string
    REPOS_CONF_FILENAME_REPOS_DATA: string
    REPOS_CONF_EXT_MODULE_DIR: string
}): Promise<ModuleEntry[]> => {
    const listRepositories = await ListRepositories({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
    })
    const listModules = await listRepositories
        .reduce(async (listModulesPromise: Promise<ModuleEntry[]>, { namespace }) => {
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