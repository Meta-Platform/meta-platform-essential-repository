const fs = require("fs")
const path = require("path")
const { pipeline } = require("stream")
const { promisify } = require("util")

const pipelineAsync = promisify(pipeline)

const DownloadBinary = async ({
    url, 
    destinationPath,
    extName
})  => {
    try {
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
        }
        const fileName = path.basename(url) + (extName ? `.${extName}` : "")
        const filePath = path.resolve(destinationPath, fileName)
        const writer = fs.createWriteStream(filePath)

        await pipelineAsync(response.body, writer)

        return filePath
    } catch (error) {
        console.error(`Download failed: ${error.message}`)
        throw error
    }
}

module.exports = DownloadBinary
