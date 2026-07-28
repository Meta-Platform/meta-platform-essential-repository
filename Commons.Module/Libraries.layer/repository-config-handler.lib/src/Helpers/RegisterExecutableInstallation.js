const GetRepositories = require("../GetRepositories")
const WriteRepositoriesFileJson = require("./WriteRepositoriesFileJson")

const RegisterExecutableInstallation = async ({
    installDataDirPath,
    repositoryNamespace,
    REPOS_CONF_FILENAME_REPOS_DATA,
    applicationData
}) => {

    const repositories = await GetRepositories({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
    })

    const thisRepo = repositories[repositoryNamespace]

    if(thisRepo){

        const alreadyRegistered = 
            !!thisRepo
            .installedApplications
            .find(
                (installedApplicationData) => 
                    installedApplicationData.executable === applicationData.executable
            )

        if(!alreadyRegistered){
            const newRepositories = {
                ...repositories,
                [repositoryNamespace]: { 
                    ...thisRepo,
                    installedApplications: [
                        ...thisRepo.installedApplications,
                        applicationData
                    ]
                }
            }
            await WriteRepositoriesFileJson({ 
                content: newRepositories,
                installDataDirPath,
                REPOS_CONF_FILENAME_REPOS_DATA
            })
            Log.info("RegisterExecutableInstallation", `O executável foi registrado ${applicationData.executable} em [${repositoryNamespace}]`)
        } else {
            Log.warn("RegisterExecutableInstallation", `o executável [${applicationData.executable}] já esta registrado em [${repositoryNamespace}]`)
        }
        
    } else 
        throw `O repositório [${repositoryNamespace}] não esta instalado!`
}

module.exports = RegisterExecutableInstallation