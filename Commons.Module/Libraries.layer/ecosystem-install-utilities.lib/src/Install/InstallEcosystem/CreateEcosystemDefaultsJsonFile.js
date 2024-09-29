const { join } = require("path")
const SmartRequire = require("../../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const WriteObjectToFile = require("../../../../write-object-to-file.lib/src/WriteObjectToFile")

const CreateEcosystemDefaultsJsonFile = async ({
    ECO_DIRPATH_INSTALL_DATA, 
    ecosystemDefaults,
    loggerEmitter
}) => {
    const { ECOSYSTEMDATA_CONF_DIRNAME_CONFIGURATIONS_DIR } = ecosystemDefaults
    const FILENAME = "ecosystem-defaults.json"
    const filePath = join(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_CONFIGURATIONS_DIR, FILENAME)
    await WriteObjectToFile(filePath, ecosystemDefaults)

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "CreateEcosystemDefaultsJsonFile",
        type: "info",
        message: `${colors.bold(FILENAME)} criado com sucesso!`
    })
}

module.exports = CreateEcosystemDefaultsJsonFile