const SmartRequire = require("../../smart-require.lib/src/SmartRequire")

const fetch = SmartRequire("node-fetch")
const fs = require("fs")
const path = require("path")

const DownloadBinary = async ({
    url, 
    destinationPath,
    extName
}) => {
    try {
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
        }
        
        const fileName = path.basename(url) + (extName ? `.${extName}` : "")
        const filePath = path.resolve(destinationPath, fileName)
        const writer = fs.createWriteStream(filePath)
        
        return new Promise((resolve, reject) => {
            response.body.pipe(writer)
            writer.on("finish", () => resolve(filePath))
            writer.on("error", reject)
        })

    } catch (error) {
        console.error(error)
    }
}

module.exports = DownloadBinary
