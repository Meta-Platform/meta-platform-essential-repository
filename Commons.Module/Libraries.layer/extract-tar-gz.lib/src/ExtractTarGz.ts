const SmartRequire = require("../../smart-require.lib/src/SmartRequire")
const tar = SmartRequire("tar")
const path = require("path") as typeof import("path")

const ListTarGzContents = require("../src/ListTarGzContents") as (source: string) => Promise<string[]>

const ExtractTarGz = async (source: string, destination: string): Promise<string> => {
    const [ fistItem ] = await ListTarGzContents(source)
    await tar.x({
        file: source,
        cwd: destination
    })
    return path.join(destination, fistItem)
}

module.exports = ExtractTarGz
