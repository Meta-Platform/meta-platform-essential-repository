const path = require("path")

const SmartRequire = require("../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const InstallEcosystem = require("./Install/InstallEcosystem")
const InstallRepository = require("./InstallRepository")

const SynchronizeNodejsDependencies    = require("./Helpers/SynchronizeNodejsDependencies")
const CollectTaskLoaderNpmDependencies = require("./Helpers/CollectTaskLoaderNpmDependencies")
const PrepareContext                   = require("./Helpers/PrepareContext")

const InstallEcosystemByProfile = async ({
    ecosystemDefaults,
    npmDependencies,
    initialRepositorySource,
    profile,
    installationDataDir,
    repositoriesInstallData,
    installationPath,
    loggerEmitter
}) => {

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "InstallEcosystemByProfile",
        type: "info",
        message: `Início de instalação usando o perfil ${colors.bold(path.basename(profile))}`
    })

    const context = PrepareContext({
        installationDataDir,
        ecosystemDefaults,
        installationPath
    })

    const {
        installDataDirPath,
        npmDependenciesContextPath
    } = context

    await InstallEcosystem({
        ecosystemDefaults,
        installationDataDir:installDataDirPath,
        initialRepositorySource,
        loggerEmitter
    })

    await SynchronizeNodejsDependencies({
        contextPath: npmDependenciesContextPath,
        dependencies: npmDependencies,
        loggerEmitter
    })

    if(repositoriesInstallData){
        for (const repositoryInstallData of repositoriesInstallData) {
            const { 
                namespace: repositoryNamespace,
                sourceData,
                executablesToInstall
             } = repositoryInstallData
            await InstallRepository({
                repositoryNamespace,
                sourceData,
                executablesToInstall,
                installDataDirPath,
                ecosystemDefaults,
                loggerEmitter
            })
        }
    }

    // Depois de instalar os repositórios, combina as `npmDependencies` declaradas nos
    // taskloaders.json instalados com a base e re-sincroniza o diretório de dependências
    // compartilhado (MPTL-17). Deps específicas de loader (electron, webpack, …) passam
    // a vir dos taskloaders; a base cobre só as deps de runtime da plataforma. Base vence
    // em versões compartilhadas.
    const taskLoaderNpmDependencies = CollectTaskLoaderNpmDependencies({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA: ecosystemDefaults.REPOS_CONF_FILENAME_REPOS_DATA
    })
    await SynchronizeNodejsDependencies({
        contextPath: npmDependenciesContextPath,
        dependencies: { ...taskLoaderNpmDependencies, ...npmDependencies },
        loggerEmitter
    })

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "InstallEcosystemByProfile",
        type: "info",
        message: `Fim da instalação do perfil ${colors.bold(path.basename(profile))}!`
    })
}

module.exports = InstallEcosystemByProfile