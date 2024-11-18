const VerifySourceIsRegistered = ({
    repositoryNamespace,
    sourceType,
    sourcesDataInformation
}) => {
    const repositorySources = sourcesDataInformation[repositoryNamespace]

    if(repositorySources && repositorySources.length > 0){
        const source = repositorySources
            .find(({sourceType: _sourceType}) => sourceType === _sourceType)

        return !!source
    }

    return false
}

module.exports = VerifySourceIsRegistered