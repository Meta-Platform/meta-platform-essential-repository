const { mkdir } = require('node:fs/promises') as typeof import('node:fs/promises')
const { join } = require('node:path') as typeof import('node:path')
const GetEnvironmentPath = require("./GetEnvironmentPath") as (environmentName: string, localPath: string) => string

/*
 * Cada ambiente de execução tem o seu próprio `logs/`, ao lado dos metadados e
 * do `.dependencies`. É o recorte que responde "o que aconteceu NESTA execução
 * deste pacote", sem depender do log central do ecossistema.
 * Ver environment-runtime-standard.md e logging-standard.md.
 */
const LOGS_DIRNAME = "logs"

const CreateEnvironmentDir = async ({
    environmentName,
    localPath,
    LOG_CONF_DIRNAME_LOGS
}: {
    environmentName: string
    localPath: string
    LOG_CONF_DIRNAME_LOGS?: string
}): Promise<void> => {
    const environmentPath = GetEnvironmentPath(environmentName, localPath)
    await mkdir(environmentPath, {recursive:true})
    await mkdir(join(environmentPath, LOG_CONF_DIRNAME_LOGS || LOGS_DIRNAME), {recursive:true})
    Log.info("CreateEnvironmentDir", `${environmentName} environment criado`)
}

module.exports = CreateEnvironmentDir
