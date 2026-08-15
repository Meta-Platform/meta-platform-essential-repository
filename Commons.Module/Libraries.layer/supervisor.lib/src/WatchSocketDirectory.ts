const { watch } = require('node:fs/promises') as typeof import('node:fs/promises')

const ListSocketFilesName = require("./ListSocketFilesName") as (directoryPath: string) => Promise<string[]>

const WatchSocketDirectory = async ({directoryPath, onChangeSocketFileList}: {
    directoryPath: string
    onChangeSocketFileList: (socketFileNames: string[]) => void
}): Promise<void> => {
    const watcher = watch(directoryPath)
    for await (const { eventType, filename } of watcher) {
        onChangeSocketFileList(await ListSocketFilesName(directoryPath))
    }
}

module.exports = WatchSocketDirectory
