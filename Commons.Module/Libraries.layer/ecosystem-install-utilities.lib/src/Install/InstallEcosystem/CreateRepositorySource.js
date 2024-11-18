const { join } = require("path")
const SmartRequire = require("../../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const WriteObjectToFile = require("../../../../json-file-utilities.lib/src/WriteObjectToFile")

const CreateRepositorySource = async ({
    installationDataDir,
    loggerEmitter,
    sourceData,
    REPOS_CONF_FILENAME_SOURCE_DATA
}) => {
    const filePath = join(installationDataDir, REPOS_CONF_FILENAME_SOURCE_DATA)
    await WriteObjectToFile(filePath, sourceData)

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "CreateRepositorySource",
        type: "info",
        message: `${colors.bold(REPOS_CONF_FILENAME_SOURCE_DATA)} criado com sucesso!`
    })
}

module.exports = CreateRepositorySource
