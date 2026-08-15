const path = require("path")

const Installer = require("../Helpers/Installer")

const InstallCommand = async ({ args, params }: { args: any, params: any }) => {

    const { profile, installationPath } = args

    const {
        ecosystemInstallUtilitiesLib
    } = params
    
    const absoluteInstallationPath = installationPath && path.resolve(process.cwd(), installationPath)
    await Installer({ 
        profile, 
        installationPath: absoluteInstallationPath,
        ecosystemInstallUtilitiesLib
    })
}

module.exports = InstallCommand