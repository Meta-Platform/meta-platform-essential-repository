const ExtractSourceData = ({
    repositoryNamespace,
    sourceType,
    sourcesDataInformation
}) => {
    const sourcesList = sourcesDataInformation[repositoryNamespace]
    return sourcesList.find((sourceData) => sourceData.sourceType === sourceType)
}

module.exports = ExtractSourceData