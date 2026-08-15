const path = require("path") as typeof import("path")
const os = require('os') as typeof import('os')

const ConvertPathToAbsolutPath = (_path: string): string => path
    .join(_path)
    .replace('~', os.homedir())

module.exports = ConvertPathToAbsolutPath