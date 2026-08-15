import type { GithubReleaseSource, ObtainRepositoryArgs } from "../../Types"

const GetReleaseLatestData = require("../../../../download-file.lib/src/GetReleaseLatestData") as (owner: string, name: string) => Promise<{ tarball_url: string }>
const DownloadBinary       = require("../../../../download-file.lib/src/DownloadBinary") as (params: { url: string, destinationPath: string, extName?: string }) => Promise<string>
const ExtractTarGz         = require("../../../../extract-tar-gz.lib/src/ExtractTarGz") as (source: string, destination: string) => Promise<string>

const DownloadFromGithubRelease = async (args: ObtainRepositoryArgs): Promise<string> => {

    const {
        sourceData,
        destinationRepoPath
    } = args

    const {
        repositoryOwner,
        repositoryName
    } = sourceData as GithubReleaseSource
    
    const releaseData = await GetReleaseLatestData(repositoryOwner, repositoryName)
    const {
        tarball_url
    } = releaseData

    const binaryPath = await DownloadBinary({
        url: tarball_url, 
        destinationPath: destinationRepoPath,
        extName: "tar.gz"
    })

    const repoPathExtract = await ExtractTarGz(binaryPath, destinationRepoPath)
    return repoPathExtract

}

module.exports = DownloadFromGithubRelease