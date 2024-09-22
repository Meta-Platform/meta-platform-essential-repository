const SmartRequire = require("../../smart-require.lib/src/SmartRequire")

const fetch = SmartRequire("node-fetch")
const fs = require("fs")
const { join } = require("path")

const DownloadFileFromGoogleDrive = async (fileId, path) => {
    const url = `https://drive.google.com/uc?export=download&id=${fileId}`
    const res = await fetch(url)

    if (!res.ok) {
        throw new Error(`Failed to fetch ${url}: ${res.statusText}`)
    }

    const disposition = res.headers.get('content-disposition')
    const fileName = disposition.match(/filename="(.+?)"/)[1]
    const filePath = join(path, fileName)
    const fileStream = fs.createWriteStream(filePath)
    await new Promise((resolve, reject) => {
        res.body.pipe(fileStream)
        res.body.on('error', reject)
        fileStream.on('finish', resolve)
    })

    return filePath
}

module.exports = DownloadFileFromGoogleDrive