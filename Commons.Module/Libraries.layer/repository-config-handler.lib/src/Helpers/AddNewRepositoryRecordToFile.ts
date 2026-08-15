import type { GetRepositoriesFn, RepositoriesFileRef, SourceData, WriteRepositoriesFileJsonFn } from "../Types"

const GetRepositories = require("../GetRepositories") as GetRepositoriesFn
const WriteRepositoriesFileJson = require("./WriteRepositoriesFileJson") as WriteRepositoriesFileJsonFn

const AddNewRepositoryRecordToFile = async ({
    repositoryNamespace,
    sourceData,
    deployedRepoPath,
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA
}: RepositoriesFileRef & {
    repositoryNamespace: string
    sourceData: SourceData
    deployedRepoPath: string
}): Promise<void> => {

    const repositories = await GetRepositories({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
    })

    if(!repositories[repositoryNamespace]){
        const newRepositories = {
            ...repositories,
            [repositoryNamespace]: {
                installationPath: deployedRepoPath,
                sourceData,
                installedApplications: []
            }
        }
        await WriteRepositoriesFileJson({
            content: newRepositories,
            installDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA
        })
        Log.info("AddNewRepositoryRecordToFile", `arquivo de repositórios atualizado com [${repositoryNamespace}] => [${deployedRepoPath}]`)
    } else
        throw `ATENÇÃO: a instalação do repositório [${repositoryNamespace}] já está registrada!`

}

module.exports = AddNewRepositoryRecordToFile
