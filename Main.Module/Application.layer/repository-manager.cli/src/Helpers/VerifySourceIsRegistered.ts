const VerifySourceIsRegistered = ({
    repositoryNamespace,
    sourceType,
    sourcesDataInformation
}: {
    repositoryNamespace: string
    sourceType: string
    sourcesDataInformation: any
}) => {
    const repositorySources = sourcesDataInformation[repositoryNamespace]

    if(repositorySources && repositorySources.length > 0){
        const source = repositorySources
            .find(({sourceType: _sourceType}: { sourceType: string }) => sourceType === _sourceType)

        return !!source
    }

    return false
}

module.exports = VerifySourceIsRegistered