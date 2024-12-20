const ExtractTarGz                = require("../../../../extract-tar-gz.lib/src/ExtractTarGz")
const DownloadFileFromGoogleDrive = require("../../../../download-file.lib/src/DownloadFileFromGoogleDrive")

const DownloadFromGoogleDrive = async (args) => {

    const {
        sourceData,
        destinationRepoPath
    } = args

    const { fileId } = sourceData
    const fileNamePath = await DownloadFileFromGoogleDrive(fileId, destinationRepoPath)
    const repoPathExtract = await ExtractTarGz(fileNamePath, destinationRepoPath)
    return repoPathExtract
}

module.exports = DownloadFromGoogleDrive
