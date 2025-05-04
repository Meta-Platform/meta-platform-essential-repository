
const ConvertPathToAbsolutPath = require("../Utils/ConvertPathToAbsolutPath")

const ListSocketsCommand = async ({ startupParams, params }) => {

    const { supervisorSocketsDirPath } = startupParams
    const { supervisorLib } = params

    const absolutSupervisorSocketsDirPath = ConvertPathToAbsolutPath(supervisorSocketsDirPath)

    const ListSocketFilesName = supervisorLib.require("ListSocketFilesName")

    const socketFileNameList = await ListSocketFilesName(absolutSupervisorSocketsDirPath)

    if (socketFileNameList.length === 0) {
        console.log("Nenhum arquivo de socket encontrado.")
    } else {
        console.log("Listagem de arquivos de socket:")
        socketFileNameList.forEach((socketFileName) => {
            console.log(`- ${socketFileName}`)
        })
    }
}

module.exports = ListSocketsCommand
