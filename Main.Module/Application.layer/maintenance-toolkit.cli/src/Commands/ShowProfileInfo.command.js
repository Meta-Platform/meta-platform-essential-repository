
const ShowProfileInfoCommand = async ({ profile }) => {
    const INSTALL_PROFILES = {
        "dev-minimal": require("../InstallationProfiles/dev-minimal.install.json"),
        "dev-standard": require("../InstallationProfiles/dev-standard.install.json"),
        "minimal": require("../InstallationProfiles/minimal.install.json"),
        "standard": require("../InstallationProfiles/standard.install.json")
    }

    const profileContent = INSTALL_PROFILES[profile]

    if (!profileContent) {
        console.log(`Perfil "${profile}" não encontrado.`.red)
        return
    }

    console.log(`Perfil: ${profile}`.yellow)
    console.log(`Diretório de Instalação: ${profileContent.installationDataDir}`.green)
    console.log("Repositórios para instalação:".green)

    profileContent.repositoriesToInstall.forEach((repo, index) => {
        console.log(`    Namespace: ${repo.repositoryNamespace}`.blue)
        console.log(`    Tipo de Fonte: ${repo.repositorySourceType}`.blue)
        console.log(`    Caminho: ${repo.repositoryPath}`.blue)

        if (repo.appsToInstall && repo.appsToInstall.length > 0) {
            console.log("    Aplicações para instalar:".magenta)
            repo.appsToInstall.forEach((app, appIndex) => {
                console.log(`      Tipo: ${app.appType}`)
                console.log(`      Executável: ${app.executable}`)
                console.log(`      Namespace do Pacote: ${app.packageNamespace}`)
                console.log(`      Nome do Socket do Supervisor: ${app.supervisorSocketFileName}`)
            })
        }
    })
}

module.exports = ShowProfileInfoCommand
