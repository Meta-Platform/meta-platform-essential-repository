const VerifyEnvironmentDir = require("./VerifyEnvironmentDir")
const CreateEnvironmentDir = require("./CreateEnvironmentDir")
const EnsureEnvironmentLogsDir = require("./EnsureEnvironmentLogsDir")

const PrepareEnvironmentDir = async ({
    environmentName,
    localPath,
    LOG_CONF_DIRNAME_LOGS
}) => {
    const environmentDirExit = await VerifyEnvironmentDir({
        environmentName,
        localPath
    })
    if(environmentDirExit){
        // Ambiente criado ANTES do logs/ existir não ganharia a pasta nunca —
        // e todo ambiente já instalado está nesse caso. Garantir aqui é o que
        // faz o log por ambiente valer para os que já existem, e não só para
        // os próximos.
        await EnsureEnvironmentLogsDir({
            environmentName,
            localPath,
            LOG_CONF_DIRNAME_LOGS
        })
        return
    } else {
        await CreateEnvironmentDir({
            environmentName,
            localPath,
            LOG_CONF_DIRNAME_LOGS
        })
    }
}

module.exports = PrepareEnvironmentDir
