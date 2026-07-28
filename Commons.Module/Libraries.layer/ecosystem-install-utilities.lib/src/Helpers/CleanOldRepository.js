const fs = require('fs/promises')
const path = require('path')

const CleanOldRepository = async ({
    namespace,
    installDataDirPath,
    ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
}) => {
    try {
        const allReposPath = path.resolve(installDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES)
        const repoPath = path.resolve(allReposPath, namespace)

        try {
            await fs.access(repoPath)
        } catch {
            Log.info("CleanOldRepository", `O diretório ${repoPath} não existe.`)
            return
        }

        const dirExists = await fs.stat(repoPath)

        if (dirExists.isDirectory()) {
            await fs.rm(repoPath, { recursive: true, force: true })

            Log.info("CleanOldRepository", `A versão antiga do repositório ${namespace} foi apagada com sucesso!`)
        } else {
            Log.error("CleanOldRepository", `${repoPath} não é um diretório.`)

            throw `${repoPath} não é um diretório`
        }
    } catch (e) {
        
        Log.error("CleanOldRepository", e)

        Log.error("CleanOldRepository", `Erro ao tentar apagar o repositório ${namespace}`)
    }
}

module.exports = CleanOldRepository