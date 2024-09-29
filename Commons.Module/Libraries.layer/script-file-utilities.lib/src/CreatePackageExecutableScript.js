const { join } = require("path")


const CreateExecutableScript = require("./CreateExecutableScript")

const CreatePackageExecutableScript = async ({
    ECO_DIRPATH_INSTALL_DATA,
    ecosystemDefaults,
    packageExecutorBinaryName,
    buildContentFunction,
    executableScriptFilename,
    loggerEmitter
}) => {

    const {
        PKG_CONF_DIRNAME_METADATA,
        ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR,
        ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
        ECOSYSTEMDATA_CONF_DIRNAME_NPM_DEPENDENCIES,
        ECOSYSTEMDATA_CONF_DIRNAME_CONFIGURATIONS_DIR,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
    } = ecosystemDefaults

    const RENDER_BINARY_DIR_PATH = join(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR, packageExecutorBinaryName)
    const scriptContent = buildContentFunction({
        RENDER_BINARY_DIR_PATH,
        RENDER_ECOSYSTEM_DATA_PATH                 : ECO_DIRPATH_INSTALL_DATA,
        RENDER_PKG_CONF_DIRNAME_METADATA           : PKG_CONF_DIRNAME_METADATA,
        RENDER_DIRNAME_MINIMAL_NODEJS_DEPENDENCIES : ECOSYSTEMDATA_CONF_DIRNAME_NPM_DEPENDENCIES,
        RENDER_DIRNAME_CONFIGURATIONS_DIR          : ECOSYSTEMDATA_CONF_DIRNAME_CONFIGURATIONS_DIR,
        RENDER_DIRNAME_DOWNLOADED_REPOSITORIES     : ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
    })

    const fullScriptPath = join(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR, executableScriptFilename)
    await CreateExecutableScript(fullScriptPath, scriptContent)


    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "CreatePackageExecutableScript",
        type: "info",
        message: `Script executável ${executableScriptFilename} criado com sucesso!`
    })

    return fullScriptPath
}

module.exports = CreatePackageExecutableScript