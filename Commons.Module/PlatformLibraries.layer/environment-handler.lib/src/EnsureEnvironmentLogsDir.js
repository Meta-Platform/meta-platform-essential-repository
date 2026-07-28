const { mkdir } = require('node:fs/promises')
const { join } = require('node:path')
const GetEnvironmentPath = require("./GetEnvironmentPath")

/*
 * Garante o `logs/` de um ambiente que JÁ EXISTE.
 *
 * `CreateEnvironmentDir` só roda quando o ambiente é criado, então todo
 * ambiente anterior a esta mudança — ou seja, todos os já instalados — ficaria
 * sem a pasta para sempre. Aqui ela é criada na próxima execução.
 *
 * `mkdir` recursivo é idempotente: se já existe, não faz nada.
 * Falhar aqui não pode impedir a execução — o sink cria o diretório sob
 * demanda de qualquer forma.
 */
const LOGS_DIRNAME = "logs"

const EnsureEnvironmentLogsDir = async ({
    environmentName,
    localPath,
    LOG_CONF_DIRNAME_LOGS
}) => {
    try {
        const environmentPath = GetEnvironmentPath(environmentName, localPath)
        await mkdir(join(environmentPath, LOG_CONF_DIRNAME_LOGS || LOGS_DIRNAME), { recursive : true })
    } catch (e) {
        /* Log é observabilidade, não caminho crítico. */
    }
}

module.exports = EnsureEnvironmentLogsDir
