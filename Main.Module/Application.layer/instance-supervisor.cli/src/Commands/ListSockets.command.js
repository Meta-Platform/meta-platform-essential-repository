
const ConvertPathToAbsolutPath = require("../Utils/ConvertPathToAbsolutPath")

const ListSocketsCommand = async ({ startupParams, params }) => {

    const { supervisorSocketsDirPath } = startupParams
    const { supervisorLib } = params

    const absolutSupervisorSocketsDirPath = ConvertPathToAbsolutPath(supervisorSocketsDirPath)

    const ListSocketFilesName = supervisorLib.require("ListSocketFilesName")

    const socketFileNameList = await ListSocketFilesName(absolutSupervisorSocketsDirPath)

    if (socketFileNameList.length === 0) {
        Log.message("ListSockets", "Nenhum arquivo de socket encontrado.")
    } else {
        Log.message("ListSockets", "Listagem de arquivos de socket:")
        socketFileNameList.forEach((socketFileName) => {
            Log.message("ListSockets", `- ${socketFileName}`)
        })
    }
}

module.exports = ListSocketsCommand
