const SmartRequire = require("../../smart-require.lib/src/SmartRequire")
const tar = SmartRequire("tar")
const path = require("path")

const ListTarGzContents = require("../src/ListTarGzContents")

const ExtractTarGz = async (source, destination) => {
    const [ fistItem ] = await ListTarGzContents(source)
    await tar.x({
        file: source,
        cwd: destination
    })
    return path.join(destination, fistItem)
}

module.exports = ExtractTarGz