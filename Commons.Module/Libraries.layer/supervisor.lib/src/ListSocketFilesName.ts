const { readdir } = require('node:fs/promises') as typeof import('node:fs/promises')

const ListSocketFiles = async (directoryPath: string): Promise<string[]> => {
    const itemList = await readdir(directoryPath, { withFileTypes: true })
    const socketFileList = itemList.filter((file) => file.isSocket())
    return socketFileList.map(socketFile => socketFile.name)
}
module.exports = ListSocketFiles
