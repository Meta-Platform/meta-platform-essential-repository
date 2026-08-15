import type { SourceData } from "../../Types"

const { join } = require("path")
const SmartRequire = require("../../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const WriteObjectToFile = require("../../../../json-file-utilities.lib/src/WriteObjectToFile")

const CreateRepositorySource = async ({
    installationDataDir,
    sourceData,
    REPOS_CONF_FILENAME_SOURCE_DATA
}: {
    installationDataDir: string
    sourceData: SourceData
    REPOS_CONF_FILENAME_SOURCE_DATA: string
}) => {
    const filePath = join(installationDataDir, REPOS_CONF_FILENAME_SOURCE_DATA)
    await WriteObjectToFile(filePath, sourceData)

    Log.info("CreateRepositorySource", `${colors.bold(REPOS_CONF_FILENAME_SOURCE_DATA)} criado com sucesso!`)
}

module.exports = CreateRepositorySource
