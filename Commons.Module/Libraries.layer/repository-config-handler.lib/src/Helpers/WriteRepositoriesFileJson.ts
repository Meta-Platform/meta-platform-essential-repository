import type { GetRepositoriesFilePathFn, WriteRepositoriesFileJsonFn } from "../Types"

const GetRepositoriesFilePath = require("./GetRepositoriesFilePath") as GetRepositoriesFilePathFn

const WriteObjectToFile = require("../../../json-file-utilities.lib/src/WriteObjectToFile") as (filepath: string, objectContent: unknown) => Promise<void>

const WriteRepositoriesFileJson: WriteRepositoriesFileJsonFn = async ({
    content,
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA
}) => {
    const filePath = GetRepositoriesFilePath({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA
    })
    try{
        await WriteObjectToFile(filePath, content)
        Log.info("WriteRepositoriesFileJson", `Repositórios atualizado com sucesso!`)
    } catch(e){
        Log.error("WriteRepositoriesFileJson", e)
        throw `erro ao escrever arquivo de repositórios ${filePath}!`
    }
}

module.exports = WriteRepositoriesFileJson
