const fs = require('fs/promises')
const path = require('path')

const CleanOldRepository = async ({
    namespace,
    absolutInstallDataDirPath,
    ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
    loggerEmitter
}) => {
    try {
        const allReposPath = path.resolve(absolutInstallDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES)
        const repoPath = path.resolve(allReposPath, namespace)

        try {
            await fs.access(repoPath)
        } catch {
            loggerEmitter && loggerEmitter.emit("log", {
                sourceName: "CleanOldRepository",
                type: "info",
                message: `O diretório ${repoPath} não existe.`
            })
            return
        }

        const dirExists = await fs.stat(repoPath)

        if (dirExists.isDirectory()) {
            await fs.rm(repoPath, { recursive: true, force: true })

            loggerEmitter && loggerEmitter.emit("log", {
                sourceName: "CleanOldRepository",
                type: "info",
                message: `A versão antiga do repositório ${namespace} foi apagada com sucesso!`
            })
        } else {
            loggerEmitter && loggerEmitter.emit("log", {
                sourceName: "CleanOldRepository",
                type: "error",
                message: `${repoPath} não é um diretório.`
            })

            throw `${repoPath} não é um diretório`
        }
    } catch (e) {
        
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "CleanOldRepository",
            type: "error",
            message: e
        })

        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "CleanOldRepository",
            type: "error",
            message: `Erro ao tentar apagar o repositório ${namespace}`
        })
    }
}

module.exports = CleanOldRepository