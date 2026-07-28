const { mkdir } = require('node:fs/promises')
const GetEnvironmentPath = require("./GetEnvironmentPath")

const CreateEnvironmentDir = async ({
    environmentName, 
    localPath
}) => {
    const environmentPath = GetEnvironmentPath(environmentName, localPath)
    await mkdir(environmentPath, {recursive:true})
    Log.info("CreateEnvironmentDir", `${environmentName} environment criado`)
}

module.exports = CreateEnvironmentDir