import type { EcosystemDefaults } from "../Types"

const { join } = require("path") as typeof import("path")

const SmartRequire = require("../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const WriteObjectToFile = require("../../../json-file-utilities.lib/src/WriteObjectToFile") as (filepath: string, objectContent: unknown) => Promise<void>

const FILENAME = "ecosystem-defaults.json"

/**
 * Materializa o `ecosystem-defaults.json` do ecossistema.
 *
 * Existia em duas cópias — uma no fluxo de instalação, outra no de atualização —
 * que diferiam apenas no NOME do mesmo parâmetro e no log. Escrever a
 * configuração do ecossistema é uma coisa só, e agora tem um lugar só.
 */
const CreateEcosystemDefaultsJsonFile = async ({
    installationDataDir,
    ecosystemDefaults
}: {
    installationDataDir: string
    ecosystemDefaults: EcosystemDefaults
}): Promise<void> => {
    const { ECOSYSTEMDATA_CONF_DIRNAME_CONFIGURATIONS_DIR } = ecosystemDefaults
    const filePath = join(installationDataDir, ECOSYSTEMDATA_CONF_DIRNAME_CONFIGURATIONS_DIR, FILENAME)
    await WriteObjectToFile(filePath, ecosystemDefaults)

    Log.info("CreateEcosystemDefaultsJsonFile", `${colors.bold(FILENAME)} criado com sucesso!`)
}

module.exports = CreateEcosystemDefaultsJsonFile
