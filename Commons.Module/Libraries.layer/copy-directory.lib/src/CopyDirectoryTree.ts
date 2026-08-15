const fs = require("fs") as typeof import("fs")
const path = require("path") as typeof import("path")

/**
 * Copia uma árvore de diretórios, pulando os nomes excluídos.
 *
 * Era duas travessias quase iguais — uma simples, outra endurecida — e a
 * simples ficaria para sempre sem as duas proteções que a outra aprendeu:
 *
 * 1. **Ciclo por symlink.** Um link que aponte para um diretório ancestral faz a
 *    recursão nunca terminar (ELOOP). A comparação é pelo caminho REAL: o
 *    aparente difere a cada volta do ciclo.
 * 2. **Tipo pelo `statSync`, não pelo `Dirent`.** O Dirent usa `lstat` — um
 *    symlink para diretório aparece como "não-diretório" — e fica sem tipo em
 *    filesystem que não preenche `d_type`. Nos dois casos o diretório cairia no
 *    `copyFileSync` e quebraria com EISDIR.
 */
const CopyDirectoryTree = (
    source: string,
    destination: string,
    excludedNames: string[] = [],
    ancestors: Set<string> = new Set()
): void => {

    const realSource = fs.realpathSync(source)
    if (ancestors.has(realSource)) return
    ancestors.add(realSource)

    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true })
    }

    for (const entryName of fs.readdirSync(source)) {

        if (excludedNames.includes(entryName)) continue

        const srcPath = path.join(source, entryName)
        const destPath = path.join(destination, entryName)

        if (fs.statSync(srcPath).isDirectory()) {
            CopyDirectoryTree(srcPath, destPath, excludedNames, ancestors)
        } else {
            fs.copyFileSync(srcPath, destPath)
        }
    }

    ancestors.delete(realSource)
}

module.exports = CopyDirectoryTree
