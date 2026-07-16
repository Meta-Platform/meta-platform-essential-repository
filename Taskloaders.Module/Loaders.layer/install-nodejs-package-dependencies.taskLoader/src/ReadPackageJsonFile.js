const { join } = require("path")

const ReadJsonFile = require("../../../../Commons.Module/Libraries.layer/json-file-utilities.lib/src/ReadJsonFile")

const ReadPackageJsonFile = (packagePath) => 
    ReadJsonFile(join(packagePath, "package.json"))

module.exports = ReadPackageJsonFile