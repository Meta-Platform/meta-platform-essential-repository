const path = require("path")

const Installer = require("../Helpers/Installer")

const InstallCommand = async ({ args }) => {

    const { profile, installationPath } = args
    
    const absoluteInstallationPath = installationPath && path.resolve(process.cwd(), installationPath)
    await Installer({ 
        profile, 
        installationPath: absoluteInstallationPath
    })
}

module.exports = InstallCommand