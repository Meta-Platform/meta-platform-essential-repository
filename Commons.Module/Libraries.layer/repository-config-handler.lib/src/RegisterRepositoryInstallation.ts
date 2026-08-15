import type { PrepareRepositoriesFileJsonFn, RepositoriesFileRef, SourceData } from "./Types"

const PrepareRepositoriesFileJson = require("./PrepareRepositoriesFileJson") as PrepareRepositoriesFileJsonFn
const AddNewRepositoryRecordToFile = require("./Helpers/AddNewRepositoryRecordToFile") as (
    params: RepositoriesFileRef & { repositoryNamespace: string, sourceData: SourceData, deployedRepoPath: string }
) => Promise<void>

const RegisterRepositoryInstallation = async ({
    repositoryNamespace,
    sourceData,
    installDataDirPath,
    deployedRepoPath,
    REPOS_CONF_FILENAME_REPOS_DATA
}: RepositoriesFileRef & {
    repositoryNamespace: string
    sourceData: SourceData
    deployedRepoPath: string
}): Promise<void> => {
    try{
        await PrepareRepositoriesFileJson({
            installDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA
        })
        await AddNewRepositoryRecordToFile({
            repositoryNamespace,
            sourceData,
            deployedRepoPath,
            installDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA
        })
        Log.info("RegisterRepositoryInstallation", `a instalação do repositório [${repositoryNamespace}] registrada com sucesso!`)
    } catch(e) {
        Log.error("RegisterRepositoryInstallation", e)
        Log.error("RegisterRepositoryInstallation", `Erro ao registrar repositório`)
    }
}

module.exports = RegisterRepositoryInstallation
