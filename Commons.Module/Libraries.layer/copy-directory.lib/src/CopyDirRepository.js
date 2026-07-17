const fs = require("fs")
const path = require("path")

const CopyDirRepository = (source, destination, ancestors = new Set()) => {

    // Um symlink que aponte para um diretório ancestral faria a recursão nunca
    // terminar (ELOOP). A comparação é pelo caminho real: o aparente difere a
    // cada volta do ciclo.
    const realSource = fs.realpathSync(source)
    if (ancestors.has(realSource)) return
    ancestors.add(realSource)

    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true })
    }

    const entries = fs.readdirSync(source)

    for (const entryName of entries) {
        if (entryName === '.git' || entryName === 'node_modules') continue
        const srcPath = path.join(source, entryName)
        const destPath = path.join(destination, entryName)

        // O tipo vem de statSync, e não do Dirent do readdirSync: o Dirent usa
        // lstat (symlink para diretório vira "não-diretório") e fica sem tipo em
        // filesystem que não preenche d_type. Nos dois casos um diretório cairia
        // no copyFileSync e quebraria com EISDIR.
        if (fs.statSync(srcPath).isDirectory()) {
            CopyDirRepository(srcPath, destPath, ancestors)
        } else {
            fs.copyFileSync(srcPath, destPath)
        }
    }

    ancestors.delete(realSource)
}

module.exports = CopyDirRepository