const { resolve } = require("path")

const ReadJsonFile = require("../../../../../Commons.Module/Libraries.layer/json-file-utilities.lib/src/ReadJsonFile")
const ListJsonFile = require("../../../../../Commons.Module/Libraries.layer/json-file-utilities.lib/src/ListJsonFile")

const ReadAllPackageMetadata = async ({ path, PKG_CONF_DIRNAME_METADATA }) => {
    try{
        const metadataDirPath = resolve(path, PKG_CONF_DIRNAME_METADATA)
        const listJsonFiles = await ListJsonFile(metadataDirPath)
        const metadata = await listJsonFiles
        .reduce(async (metadataAccPromise, file) => {
            const metadataAcc = await metadataAccPromise
            const { path, name:filename } = file
            const extFile  = filename.split(".").pop()
            const name     = filename.replace(`.${extFile}`, "")
            const filePath = resolve(path, filename)
            const content  = await ReadJsonFile(filePath)
            return {...metadataAcc, [name]:content}
        },Promise.resolve({}))
        return metadata
    }catch(e){
        return undefined
    }
}

module.exports = ReadAllPackageMetadata