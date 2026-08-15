const CopyDirectoryTree = require("./CopyDirectoryTree") as (source: string, destination: string, excludedNames?: string[]) => void

/** Copia uma árvore inteira, sem exclusões. */
const CopyDirectory = (source: string, destination: string): void =>
    CopyDirectoryTree(source, destination)

module.exports = CopyDirectory
