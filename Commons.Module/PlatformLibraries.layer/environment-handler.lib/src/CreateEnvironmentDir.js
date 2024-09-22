const { mkdir } = require('node:fs/promises')
const GetEnvironmentPath = require("./GetEnvironmentPath")

const CreateEnvironmentDir = async ({
    environmentName, 
    localPath,
    loggerEmitter
}) => {
    const environmentPath = GetEnvironmentPath(environmentName, localPath)
    await mkdir(environmentPath, {recursive:true})
    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "CreateEnvironmentDir",
        type: "info",
        message: `${environmentName} environment criado`
    })
}

module.exports = CreateEnvironmentDir