const SetupCLIScriptLoader = require("meta-platform-cli-script-loader-library/SetupCLIScriptLoader")
const APP_PARAMS = require("../Configs/app-params-dev.json")
const NPM_DEPENDENCIES =  require("../Configs/npm-dependencies.json")
const META_PLATFORM_DEPENDENCIES = require("../Configs/meta-platform-dependencies.json")

const ListSocketsCommand = async () => {

    const LoaderScript = await SetupCLIScriptLoader( {
        npmDependenciesDirname   : APP_PARAMS.NPM_DEPENDENCIES_DIRNAME,
        npmDependencies          : NPM_DEPENDENCIES,
        metaPlatformDependencies : META_PLATFORM_DEPENDENCIES,
        sourceType               : APP_PARAMS.MINIMUM_REPO_SOURCE_TYPE,
        repoPath                 : APP_PARAMS.MINIMUM_REPO_PATH,
        repoNamespace            : APP_PARAMS.MINIMUM_REPO_NAMESPACE,
        fileId                   : APP_PARAMS.MINIMUM_REPO_FILE_ID
    })

	const ListSocketFilesName = LoaderScript("supervisor.lib/src/ListSocketFilesName")

    const socketFileNameList = await ListSocketFilesName(APP_PARAMS.SUPERVISOR_SOCKETS_DIRPATH)

    if (socketFileNameList.length === 0) {
        console.log("Nenhum arquivo de socket encontrado.")
    } else {
        console.log("Listagem de arquivos de socket:")
        socketFileNameList.forEach((socketFileName) => {
            console.log(`- ${socketFileName}`)
        })
    }
}

module.exports = ListSocketsCommand
