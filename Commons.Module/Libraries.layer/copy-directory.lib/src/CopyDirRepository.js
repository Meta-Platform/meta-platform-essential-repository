const fs = require('fs')
const path = require('path')

const CopyDirRepository = async (src, dest) => {
    await fs.promises.mkdir(dest, { recursive: true })
    const entries = await fs.promises.readdir(src, { withFileTypes: true })

    for (let entry of entries) {
        if (entry.name === '.git' || entry.name === 'node_modules') continue
        const srcPath = path.join(src, entry.name)
        const destPath = path.join(dest, entry.name)

        if (entry.isDirectory()) {
            await CopyDirRepository(srcPath, destPath)
        } else {
            await fs.promises.copyFile(srcPath, destPath)
        }
    }
}


module.exports = CopyDirRepository