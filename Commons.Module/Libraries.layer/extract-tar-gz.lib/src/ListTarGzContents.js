const SmartRequire = require("../../smart-require.lib/src/SmartRequire")
const tar = SmartRequire("tar")

const ListTarGzContents = async (source) => {
    let fileList = []
    await tar.list({
        file: source,
        onentry: entry => fileList.push(entry.path)
    })
    return fileList
}

module.exports = ListTarGzContents