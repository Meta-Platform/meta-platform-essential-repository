const SmartRequire = require("../../smart-require.lib/src/SmartRequire")
const tar = SmartRequire("tar")

const ListTarGzContents = async (source: string): Promise<string[]> => {
    let fileList: string[] = []
    await tar.list({
        file: source,
        onentry: (entry: { path: string }) => fileList.push(entry.path)
    })
    return fileList
}

module.exports = ListTarGzContents
