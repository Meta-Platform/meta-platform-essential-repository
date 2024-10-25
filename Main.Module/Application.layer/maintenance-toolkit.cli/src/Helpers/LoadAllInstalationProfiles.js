const LoadAllInstalationProfiles = () => {

    const INSTALLATION_PROFILES = {
        "localfs-full"            : require("../InstallationProfiles/localfs-full.install.json"),
        "localfs-minimal"         : require("../InstallationProfiles/localfs-minimal.install.json"),
        "localfs-standard"        : require("../InstallationProfiles/localfs-standard.install.json"),
        "dev-localfs-full"        : require("../InstallationProfiles/dev-localfs-full.install.json"),
        "dev-localfs-minimal"     : require("../InstallationProfiles/dev-localfs-minimal.install.json"),
        "dev-localfs-standard"    : require("../InstallationProfiles/dev-localfs-standard.install.json"),
        "github-release-minimal"  : require("../InstallationProfiles/github-release-minimal.install.json"),
        "github-release-standard" : require("../InstallationProfiles/github-release-standard.install.json"),
        "github-repo-minimal"     : require("../InstallationProfiles/github-repo-minimal.install.json"),
        "github-repo-standard"    : require("../InstallationProfiles/github-repo-standard.install.json"),
        "google-drive-minimal"    : require("../InstallationProfiles/google-drive-minimal.install.json"),
        "google-drive-standard"   : require("../InstallationProfiles/google-drive-standard.install.json")
    }

    return INSTALLATION_PROFILES
}

module.exports = LoadAllInstalationProfiles