import type { RemoveExecutableScriptFn } from "./Types"

const fs = (require('fs') as typeof import('fs')).promises

const RemoveExecutableScript: RemoveExecutableScriptFn = async (filePath) => {

    try {
        await fs.access(filePath)
    } catch {
        Log.info("RemoveExecutableScript", `O Executável ${filePath} não existe.`)
        return
    }

    try {
        await fs.unlink(filePath)
        Log.warn("RemoveExecutableScript", `Executável removido com sucesso: ${filePath}`)


    } catch (error: any) {
        Log.error("RemoveExecutableScript", error)
        Log.error("RemoveExecutableScript", `Erro ao remover o arquivo: ${filePath}, erro: ${error.message}`)
        throw error
    }
}

module.exports = RemoveExecutableScript
