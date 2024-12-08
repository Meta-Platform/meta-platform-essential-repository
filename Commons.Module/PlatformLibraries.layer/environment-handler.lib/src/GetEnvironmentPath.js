const { join } = require('path')

const GetEnvironmentPath = (environmentName, localPath) =>
    `${join(localPath, environmentName)}`

module.exports = GetEnvironmentPath