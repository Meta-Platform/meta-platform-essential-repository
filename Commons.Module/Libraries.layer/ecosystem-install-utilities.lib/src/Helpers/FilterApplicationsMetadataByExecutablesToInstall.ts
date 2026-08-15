import type { InstalledApplication } from "../Types"

const FilterApplicationsMetadataByExecutablesToInstall = ({
    executablesToInstall,
    applicationsMetadata
}: {
    executablesToInstall: string[]
    applicationsMetadata: InstalledApplication[]
}): InstalledApplication[] => {
    return applicationsMetadata.filter(item => executablesToInstall.includes(item.executable))
}

module.exports = FilterApplicationsMetadataByExecutablesToInstall