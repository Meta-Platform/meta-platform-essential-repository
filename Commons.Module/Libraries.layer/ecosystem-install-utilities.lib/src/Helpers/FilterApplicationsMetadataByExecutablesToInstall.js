const FilterApplicationsMetadataByExecutablesToInstall = ({
    executablesToInstall,
    applicationsMetadata
}) => {
    return applicationsMetadata.filter(item => executablesToInstall.includes(item.executable))
}

module.exports = FilterApplicationsMetadataByExecutablesToInstall