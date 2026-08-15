const ExtractSourceData = ({
    repositoryNamespace,
    sourceType,
    sourcesDataInformation
}: {
    repositoryNamespace: string
    sourceType: string
    sourcesDataInformation: any
}) => {
    const sourcesList = sourcesDataInformation[repositoryNamespace]
    return sourcesList.find((sourceData: any) => sourceData.sourceType === sourceType)
}

module.exports = ExtractSourceData