const PrepareRepositoriesFileJson = require("./PrepareRepositoriesFileJson")
const AddNewRepositoryRecordToFile = require("./Helpers/AddNewRepositoryRecordToFile")

const RegisterRepositoryInstallation = async ({
    repositoryNamespace,
    sourceData,
    installDataDirPath,
    deployedRepoPath,
    REPOS_CONF_FILENAME_REPOS_DATA
}) => {
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