const path = require("path")

const Updater = require("../Helpers/Updater")

const UpdateCommand = async ({ profile, installationPath }) => {   
    const absoluteInstallationPath = installationPath && path.resolve(process.cwd(), installationPath)
    await Updater({ 
        profile, 
        installationPath: absoluteInstallationPath
    })
}

module.exports = UpdateCommand