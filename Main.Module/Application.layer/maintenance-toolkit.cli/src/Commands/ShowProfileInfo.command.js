
const ShowProfileInfoCommand = async ({ args }) => {
    
    const { profile } = args

    const INSTALL_PROFILES = {
        "dev-minimal": require("../InstallationProfiles/dev-minimal.install.json"),
        "dev-standard": require("../InstallationProfiles/dev-standard.install.json"),
        "minimal": require("../InstallationProfiles/minimal.install.json"),
        "standard": require("../InstallationProfiles/standard.install.json")
    }

    const profileContent = INSTALL_PROFILES[profile]

    if (!profileContent) {
        Log.message("ShowProfileInfo", `Perfil "${profile}" não encontrado.`.red)
        return
    }

    Log.message("ShowProfileInfo", `Perfil: ${profile}`.yellow)
    Log.message("ShowProfileInfo", `Diretório de Instalação: ${profileContent.installationDataDir}`.green)
    Log.message("ShowProfileInfo", "Repositórios para instalação:".green)

    profileContent.repositoriesToInstall.forEach((repo, index) => {
        Log.message("ShowProfileInfo", `    Namespace: ${repo.repositoryNamespace}`.blue)
        Log.message("ShowProfileInfo", `    Tipo de Fonte: ${repo.repositorySourceType}`.blue)
        Log.message("ShowProfileInfo", `    Caminho: ${repo.repositoryPath}`.blue)

        if (repo.appsToInstall && repo.appsToInstall.length > 0) {
            Log.message("ShowProfileInfo", "    Aplicações para instalar:".magenta)
            repo.appsToInstall.forEach((app, appIndex) => {
                Log.message("ShowProfileInfo", `      Tipo: ${app.appType}`)
                Log.message("ShowProfileInfo", `      Executável: ${app.executable}`)
                Log.message("ShowProfileInfo", `      Namespace do Pacote: ${app.packageNamespace}`)
                Log.message("ShowProfileInfo", `      Nome do Socket do Supervisor: ${app.supervisorSocketFileName}`)
            })
        }
    })
}

module.exports = ShowProfileInfoCommand
