const { join } = require("path")

const WriteObjectToFile = require("../../../../json-file-utilities.lib/src/WriteObjectToFile")

const CreateEcosystemDefaultsJsonFile = async ({
    ECO_DIRPATH_INSTALL_DATA, 
    ecosystemDefaults
}) => {
    const { ECOSYSTEMDATA_CONF_DIRNAME_CONFIGURATIONS_DIR } = ecosystemDefaults
    const FILENAME = "ecosystem-defaults.json"
    const filePath = join(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_CONFIGURATIONS_DIR, FILENAME)
    await WriteObjectToFile(filePath, ecosystemDefaults)
}

module.exports = CreateEcosystemDefaultsJsonFile