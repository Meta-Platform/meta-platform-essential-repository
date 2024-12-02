const { watch } = require('node:fs/promises')

const ListSocketFilesName = require("./ListSocketFilesName")

const WatchSocketDirectory = async ({directoryPath, onChangeSocketFileList}) => {
    const watcher = watch(directoryPath)
    for await (const { eventType, filename } of watcher) {
        onChangeSocketFileList(await ListSocketFilesName(directoryPath))
    }
}

module.exports = WatchSocketDirectory
