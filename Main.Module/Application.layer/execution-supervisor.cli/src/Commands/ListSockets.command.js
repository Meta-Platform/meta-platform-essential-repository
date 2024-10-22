const ListSocketFilesName = require("../../../../Libraries.layer/supervisor.lib/src/ListSocketFilesName")

const ListSocketsCommand = async ({ startupParams }) => {

    const { supervisorSocketsDirPath } = startupParams

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
