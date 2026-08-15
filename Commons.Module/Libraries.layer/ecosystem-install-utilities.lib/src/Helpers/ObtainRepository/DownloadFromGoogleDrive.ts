import type { GoogleDriveSource, ObtainRepositoryArgs } from "../../Types"

const ExtractTarGz                = require("../../../../extract-tar-gz.lib/src/ExtractTarGz") as (source: string, destination: string) => Promise<string>
const DownloadFileFromGoogleDrive = require("../../../../download-file.lib/src/DownloadFileFromGoogleDrive") as (fileId: string, path: string) => Promise<string>

const DownloadFromGoogleDrive = async (args: ObtainRepositoryArgs): Promise<string> => {

    const {
        sourceData,
        destinationRepoPath
    } = args

    const { fileId } = sourceData as GoogleDriveSource
    const fileNamePath = await DownloadFileFromGoogleDrive(fileId, destinationRepoPath)
    const repoPathExtract = await ExtractTarGz(fileNamePath, destinationRepoPath)
    return repoPathExtract
}

module.exports = DownloadFromGoogleDrive
