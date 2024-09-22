const { 
    readdir
} = require('node:fs/promises')

const ListDir = async (path) => {
    const listItems = await readdir(path, { withFileTypes: true })
    const listDir =  listItems.filter((file) => file.isDirectory() )
    return listDir
}

const ListValidDirDescriptor = async ({ path, ext }) => {
    const listItems = await ListDir(path)

    if(Array.isArray(ext)){
        return listItems.filter((file) => {
            const extFile = file.name.split(".").pop()
            return ext.includes(extFile)
        })
    } else {
        return listItems.filter((file) => {
            const extFile = file.name.split(".").pop()
            return extFile === ext
        })
    }
}

const ListDirName = async ({ path, ext }) => {
    const directories = await ListValidDirDescriptor({ path, ext })
    const listName = directories.map(file => {
        const filename       = file.name
        const filenameLength = filename.length
        return filename.slice(0, filenameLength-(ext.length+1))
    })
    return listName
}

const ListDirNameAndExt = async ({ path, ext }) => {
    const directories = await ListValidDirDescriptor({ path, ext })
    const listName = directories.map(file => {
        const ext = file.name.split(".").pop()
        const name = file.name.replace(`.${ext}`, "")
        return { name, ext }
    })
    return listName
}

module.exports = {
    listName:ListDirName,
    listNameAndExt:ListDirNameAndExt
}