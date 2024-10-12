const path = require("path")

const Installer = require("../Helpers/Installer")

const InstallCommand = async ({ profile, installationPath }) => {   
    const absoluteInstallationPath = installationPath && path.resolve(process.cwd(), installationPath)
    await Installer({ 
        profile, 
        installationPath: absoluteInstallationPath
    })
}

module.exports = InstallCommand