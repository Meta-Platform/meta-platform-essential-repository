const LoadAllInstalationProfiles = require("../Helpers/LoadAllInstalationProfiles")

const ListProfilesCommand = async () => {
    console.log("\x1b[35m%s\x1b[0m", "Meta Platform Setup Wizard")
    const installationProfiles = LoadAllInstalationProfiles()
    const profileNameList = Object.keys(installationProfiles)
    console.log("\x1b[32m%s\x1b[0m", "Perfis de instalação disponíveis:")
    profileNameList.forEach((profile) => console.log("\x1b[34m%s\x1b[0m", profile))
}

module.exports = ListProfilesCommand
