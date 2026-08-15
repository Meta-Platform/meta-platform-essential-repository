//TODO Muito especifico não deveria estar aqui
import type { RetryOptions } from "./RunWithRetry"

const { RunWithRetry } = require("./RunWithRetry") as {
    RunWithRetry: <T>(operation: (attempt: number) => Promise<T>, options?: RetryOptions) => Promise<T>
}

/** O que a plataforma consome da release do GitHub — não a resposta inteira. */
export type GithubRelease = {
    tarball_url: string
    assets: { browser_download_url: string }[]
}

const RequestData = async <T>(url: string): Promise<T> =>
  RunWithRetry(async () => {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
    }

    return await response.json() as T
  }, { label: "metadados da release" })

const GetReleaseLatestData = async (repoOwner: string, repoName: string): Promise<GithubRelease> => {
  const releaseUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`
  return await RequestData<GithubRelease>(releaseUrl)
}

module.exports = GetReleaseLatestData
