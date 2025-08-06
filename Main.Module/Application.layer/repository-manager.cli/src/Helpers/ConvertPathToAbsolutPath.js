const os = require('os')

const path = require("path")

const ConvertPathToAbsolutPath = (_path) => path
    .join(_path)
    .replace('~', os.homedir())


module.exports = ConvertPathToAbsolutPath