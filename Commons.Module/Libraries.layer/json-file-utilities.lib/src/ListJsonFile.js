const { readdir } = require('node:fs/promises')

const ListJsonFile = async (directoryPath) => {
    const listItems = await readdir(directoryPath, { withFileTypes: true })
    const listFiles = listItems.filter((file) => file.isFile())
    const listJsonFiles = listFiles.filter((file) => {
        const extFile = file.name.split(".").pop()
        return extFile === "json"
    }).map(file => ({ path: directoryPath, name: file.name }))

    return listJsonFiles
}

module.exports = ListJsonFile
