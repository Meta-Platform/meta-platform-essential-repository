const ListSocketsCommand = async ({ startupParams, params }) => {

    const { supervisorSocketsDirPath } = startupParams
    const { supervisorLib } = params

    const ListSocketFilesName = supervisorLib.require("ListSocketFilesName")

    const socketFileNameList = await ListSocketFilesName(supervisorSocketsDirPath)

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
