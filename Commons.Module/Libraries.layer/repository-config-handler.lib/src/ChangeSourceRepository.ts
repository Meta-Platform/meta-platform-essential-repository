import type { GetRepositoriesFn, RepositoriesFileRef, SourceData, WriteRepositoriesFileJsonFn } from "./Types"

const GetRepositories = require("./GetRepositories") as GetRepositoriesFn
const WriteRepositoriesFileJson = require("./Helpers/WriteRepositoriesFileJson") as WriteRepositoriesFileJsonFn

const ChangeSourceRepository = async ({
    repositoryNamespace,
    sourceData,
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA
}: RepositoriesFileRef & {
    repositoryNamespace: string
    sourceData: SourceData
}): Promise<void> => {

    const repositories = await GetRepositories({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
    })

    if(repositories[repositoryNamespace]){

        const sourceTypeOld = repositories[repositoryNamespace]?.sourceData?.sourceType

        const newRepositories = {
            ...repositories,
            [repositoryNamespace]: {
                ...repositories[repositoryNamespace],
                sourceData
            }
        }
        await WriteRepositoriesFileJson({
            content: newRepositories,
            installDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA
        })
        Log.info("ChangeSourceRepository", `a fonte do repositório [${repositoryNamespace}] foi alterada de [${sourceTypeOld}] para [${sourceData.sourceType}]`)
    } else
        throw `ATENÇÃO: o repositório [${repositoryNamespace}] não esta instalado!`

}

module.exports = ChangeSourceRepository
