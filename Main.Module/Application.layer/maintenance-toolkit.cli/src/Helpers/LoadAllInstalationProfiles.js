


const LoadAllInstalationProfiles = () => {

    const INSTALLATION_PROFILES = {
        "dev-minimal-localfs"     : require("../InstallationProfiles/dev-localfs/minimal.install.json"),
        "dev-standard-localfs"    : require("../InstallationProfiles/dev-localfs/standard.install.json"),
        "minimal-github-release"  : require("../InstallationProfiles/github-release/minimal.install.json"),
        "standard-github-release" : require("../InstallationProfiles/github-release/standard.install.json"),
        "minimal-github-repo"     : require("../InstallationProfiles/github-repo/minimal.install.json"),
        "standard-github-repo"    : require("../InstallationProfiles/github-repo/standard.install.json"),
        "minimal-google-drive"    : require("../InstallationProfiles/google-drive/minimal.install.json"),
        "standard-google-drive"   : require("../InstallationProfiles/google-drive/standard.install.json")
    }

    return INSTALLATION_PROFILES
}

module.exports = LoadAllInstalationProfiles