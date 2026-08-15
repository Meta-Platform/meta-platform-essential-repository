import type { JsonFileEntry } from "../../json-file-utilities.lib/src/ListJsonFile"

const { resolve } = require("path") as typeof import("path")

const ReadJsonFile = require("../../json-file-utilities.lib/src/ReadJsonFile") as (path: string) => any
const ListJsonFile = require("../../json-file-utilities.lib/src/ListJsonFile") as (directoryPath: string) => Promise<JsonFileEntry[]>

/** Metadados do package, indexados pelo nome do arquivo sem extensão. */
export type MetadataDir = Record<string, any>

const LoadMetadataDir = async ({
    metadataDirName,
    path
}: {
    metadataDirName: string
    path: string
}): Promise<MetadataDir | undefined> => {
    try{
        const metadataDirPath = resolve(path, metadataDirName)
        const listJsonFiles = await ListJsonFile(metadataDirPath)
        const metadata = await listJsonFiles
        .reduce(async (metadataAccPromise: Promise<MetadataDir>, file) => {
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

module.exports = LoadMetadataDir
