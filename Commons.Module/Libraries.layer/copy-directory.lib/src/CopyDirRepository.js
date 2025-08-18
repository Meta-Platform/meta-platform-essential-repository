const fs = require("fs")
const path = require("path")

const CopyDirRepository = (source, destination) => {
    
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true })
    }

    const entries = fs.readdirSync(source, { withFileTypes: true })

    for (const entry of entries) {
        if (entry.name === '.git' || entry.name === 'node_modules') continue
        const srcPath = path.join(source, entry.name)
        const destPath = path.join(destination, entry.name)

        if (entry.isDirectory()) {
            CopyDirRepository(srcPath, destPath)
        } else {
            fs.copyFileSync(srcPath, destPath)
        }
    }
}

module.exports = CopyDirRepository