import type { EcosystemDefaults } from "./Types"

const path = require("path")

const RemoveExecutableScript = require("../../script-file-utilities.lib/src/RemoveExecutableScript")
const UnregisterExecutableInstallation = require("../../repository-config-handler.lib/src/Helpers/UnregisterExecutableInstallation")

// Desinstala uma aplicação: apaga os scripts do executável (normal e -dbg) do
// diretório global de executáveis e remove a entrada de installedApplications.
// É o inverso exato de Install/InstallApplication.
const UninstallApplication = async ({
    repositoryNamespace,
    executable,
    installDataDirPath,
    ecosystemDefaults
}: {
    repositoryNamespace: string
    executable: string
    installDataDirPath: string
    ecosystemDefaults: EcosystemDefaults
}) => {

    const {
        ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
        REPOS_CONF_FILENAME_REPOS_DATA
    } = ecosystemDefaults

    Log.info("UninstallApplication", `Início da desinstalação do executável ${executable} de [${repositoryNamespace}]`)

    const executablesDirPath = path.join(installDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR)

    await RemoveExecutableScript(path.join(executablesDirPath, executable))
    await RemoveExecutableScript(path.join(executablesDirPath, `${executable}-dbg`))

    await UnregisterExecutableInstallation({
        installDataDirPath,
        repositoryNamespace,
        REPOS_CONF_FILENAME_REPOS_DATA,
        executable
    })

    Log.info("UninstallApplication", `O executável ${executable} do repositório ${repositoryNamespace} foi desinstalado!`)

    return { uninstalled: true, executable }
}

module.exports = UninstallApplication
