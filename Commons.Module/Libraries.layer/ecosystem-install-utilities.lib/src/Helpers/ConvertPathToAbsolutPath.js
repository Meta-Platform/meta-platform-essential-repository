const path = require("path")
const os = require('os')

const ConvertPathToAbsolutPath = (_path) => path
    .join(_path)
    .replace('~', os.homedir())

module.exports = ConvertPathToAbsolutPath