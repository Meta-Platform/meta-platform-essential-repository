const { join } = require('path') as typeof import('path')

const GetEnvironmentPath = (environmentName: string, localPath: string): string =>
    `${join(localPath, environmentName)}`

module.exports = GetEnvironmentPath