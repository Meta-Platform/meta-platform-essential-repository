const { join } = require('path')

const GetEnvironmentPath = (environmentName, localPath) =>
    `${join(localPath, environmentName)}.rtenv`

module.exports = GetEnvironmentPath