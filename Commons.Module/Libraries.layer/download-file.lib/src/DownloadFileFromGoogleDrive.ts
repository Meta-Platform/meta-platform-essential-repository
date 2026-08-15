import type { RetryOptions } from "./RunWithRetry"

const fs = require("fs") as typeof import("fs")
const { join } = require("path") as typeof import("path")
const { RunWithRetry } = require("./RunWithRetry") as {
    RunWithRetry: <T>(operation: (attempt: number) => Promise<T>, options?: RetryOptions) => Promise<T>
}

const DownloadFileFromGoogleDrive = async (fileId: string, path: string): Promise<string> => {
    const url = `https://drive.google.com/uc?export=download&id=${fileId}`

    return await RunWithRetry(async () => {
        const res = await fetch(url)

        if (!res.ok) {
            throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
        }

        const disposition = res.headers.get('content-disposition')
        const fileName = disposition!.match(/filename="(.+?)"/)![1]
        const filePath = join(path, fileName)
        // Recomeço limpo entre tentativas (ver DownloadBinary).
        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath)
        }
        const fileStream = fs.createWriteStream(filePath)
        await new Promise<void>((resolve, reject) => {
            const body = res.body as any
            body.pipe(fileStream)
            body.on('error', reject)
            fileStream.on('finish', resolve)
        })

        return filePath
    }, { label: "download do Google Drive" })
}

module.exports = DownloadFileFromGoogleDrive
