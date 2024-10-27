const path = require("path")

const Installer = require("../Helpers/Installer")

const InstallCommand = async ({ args, params }) => {

    const { profile, installationPath } = args

    const {
        ecosystemInstallUtilitiesLib,
        printDataLogLib
    } = params
    
    const absoluteInstallationPath = installationPath && path.resolve(process.cwd(), installationPath)
    await Installer({ 
        profile, 
        installationPath: absoluteInstallationPath,
        ecosystemInstallUtilitiesLib,
        printDataLogLib
    })
}

module.exports = InstallCommand