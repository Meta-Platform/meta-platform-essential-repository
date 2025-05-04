const { join } = require('path')
const os = require('os')

const ConvertPathToAbsolutPath = (_path) => join(_path).replace('~', os.homedir())

module.exports = ConvertPathToAbsolutPath