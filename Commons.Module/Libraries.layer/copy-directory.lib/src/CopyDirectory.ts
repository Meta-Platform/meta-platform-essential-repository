const fs = require("fs") as typeof import("fs")
const path = require("path") as typeof import("path")

const CopyDirectory = (source: string, destination: string): void => {

    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true })
    }

    const entries = fs.readdirSync(source, { withFileTypes: true })

    for (const entry of entries) {
        const srcPath = path.join(source, entry.name)
        const destPath = path.join(destination, entry.name)

        if (entry.isDirectory()) {
            CopyDirectory(srcPath, destPath)
        } else {
            fs.copyFileSync(srcPath, destPath)
        }
    }
}

module.exports = CopyDirectory
