import type { EcosystemDefaults } from "../Types"

const SmartRequire = require("../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")
const { resolve } = require("path")
const { 
    mkdir
} = require('node:fs/promises')

const BuildObjectFromPrefix = require("../Helpers/BuildObjectFromPrefix")

/*
 * Os domínios de `logs/`, conforme o Logging Standard:
 *   ecosystem/    — daemon, CLIs, instalação e wizard
 *   applications/ — por pacote de aplicação
 *   instances/    — um arquivo por instância em execução
 */
const DOMINIOS_DE_LOG = ["ecosystem", "applications", "instances"]

/*
 * O laço acima cria os diretórios varrendo o prefixo `ECOSYSTEMDATA_CONF_DIRNAME_`.
 * O diretório de log tem prefixo próprio (`LOG_CONF_`), então não entraria por
 * ali — e ele precisa de subdiretórios, que aquele laço também não montaria.
 */
const ConstructLogsStructure = async ({ installationDataDir, ecosystemDefaults }: {
    installationDataDir: string
    ecosystemDefaults: EcosystemDefaults
}) => {

    const dirname = ecosystemDefaults.LOG_CONF_DIRNAME_LOGS || "logs"
    const logsPath = resolve(installationDataDir, dirname)

    for (const dominio of DOMINIOS_DE_LOG) {
        await mkdir(resolve(logsPath, dominio), { recursive: true })
    }

    Log.info("ConstructEcosystemStructure", `Diretório de log ${colors.bold(dirname)} criado com os domínios ${DOMINIOS_DE_LOG.join(", ")}`)
}

const ConstructEcosystemStructure = async ({
    installationDataDir,
    ecosystemDefaults
}: {
    installationDataDir: string
    ecosystemDefaults: EcosystemDefaults
}) => {

    const ecosystemDefaultsConfDirname = BuildObjectFromPrefix(ecosystemDefaults, "ECOSYSTEMDATA_CONF_DIRNAME_")

    try{
        await mkdir(installationDataDir, { recursive: true })
        Log.info("ConstructEcosystemStructure", `O diretório de dados do ecosistema criado com sucesso em ${colors.bold(installationDataDir)}`)

        for (const configKey of Object.keys(ecosystemDefaultsConfDirname)) {

            Log.info("ConstructEcosystemStructure", `Verificando configuração ${colors.bold(configKey)}`)
            
           const dirname = ecosystemDefaultsConfDirname[configKey]
           await mkdir(resolve(installationDataDir, dirname))
           Log.info("ConstructEcosystemStructure", `Configuração ${ colors.bold(configKey)}: o subdiretório ${ colors.bold(dirname)} criado com sucesso!`)
        }

        await ConstructLogsStructure({ installationDataDir, ecosystemDefaults })

    } catch (e){
        Log.error("ConstructEcosystemStructure", `erro ao criar diretório de dados do ecosistema ${colors.bold(installationDataDir)}`)
        Log.warn("ConstructEcosystemStructure", `Verifique se o ecosistema já esta instalado.`)
        throw e
    }
}

module.exports = ConstructEcosystemStructure