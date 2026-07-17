const fs = require("fs")
const { join } = require("path")
const { RunWithRetry } = require("./RunWithRetry")

const DownloadFileFromGoogleDrive = async (fileId, path) => {
    const url = `https://drive.google.com/uc?export=download&id=${fileId}`

    return await RunWithRetry(async () => {
        const res = await fetch(url)

        if (!res.ok) {
            throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
        }

        const disposition = res.headers.get('content-disposition')
        const fileName = disposition.match(/filename="(.+?)"/)[1]
        const filePath = join(path, fileName)
        // Recomeço limpo entre tentativas (ver DownloadBinary).
        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath)
        }
        const fileStream = fs.createWriteStream(filePath)
        await new Promise((resolve, reject) => {
            res.body.pipe(fileStream)
            res.body.on('error', reject)
            fileStream.on('finish', resolve)
        })

        return filePath
    }, { label: "download do Google Drive" })
}

module.exports = DownloadFileFromGoogleDrive
