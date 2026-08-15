const path = require("path")

const Updater = require("../Helpers/Updater")

const UpdateCommand = async ({ args, params }: { args: any, params: any }) => {

    const {
        ecosystemInstallUtilitiesLib
    } = params

    const { profile, installationPath } = args

    const absoluteInstallationPath = installationPath && path.resolve(process.cwd(), installationPath)
    await Updater({ 
        profile, 
        installationPath: absoluteInstallationPath,
        ecosystemInstallUtilitiesLib
    })
}

module.exports = UpdateCommand