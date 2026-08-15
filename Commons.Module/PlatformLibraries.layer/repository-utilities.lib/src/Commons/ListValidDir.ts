const { 
    readdir
} = require('node:fs/promises') as typeof import('node:fs/promises')

/** Um diretório de item da hierarquia, já separado em nome e extensão. */
export type DirNameAndExt = { name: string, ext: string }

const ListDir = async (path: string) => {
    const listItems = await readdir(path, { withFileTypes: true })
    const listDir =  listItems.filter((file) => file.isDirectory() )
    return listDir
}

const ListValidDirDescriptor = async ({ path, ext }: { path: string, ext: string | string[] }) => {
    const listItems = await ListDir(path)

    if(Array.isArray(ext)){
        return listItems.filter((file) => {
            const extFile = file.name.split(".").pop()
            return ext.includes(extFile!)
        })
    } else {
        return listItems.filter((file) => {
            const extFile = file.name.split(".").pop()
            return extFile === ext
        })
    }
}

const ListDirName = async ({ path, ext }: { path: string, ext: string }): Promise<string[]> => {
    try {
        const directories = await ListValidDirDescriptor({ path, ext })
        const listName = directories.map(file => {
            const filename       = file.name
            const filenameLength = filename.length
            return filename.slice(0, filenameLength-(ext.length+1))
        })
        return listName
    } catch (err) {
        return []
    }
}

const ListDirNameAndExt = async ({ path, ext }: { path: string, ext: string | string[] }): Promise<DirNameAndExt[]> => {
    const directories = await ListValidDirDescriptor({ path, ext })
    const listName = directories.map(file => {
        const ext = file.name.split(".").pop()!
        const name = file.name.replace(`.${ext}`, "")
        return { name, ext }
    })
    return listName
}

module.exports = {
    listName:ListDirName,
    listNameAndExt:ListDirNameAndExt
}