const RegisterNewSourceCommand = ({ 
    args, 
    startupParams,
    params
}) => {

    const {
        repositoryNamespace,
        sourceType,
        localPath,
        repoName,
        repoOwner,
        fileId
    } = args

    console.log({
        repositoryNamespace,
        sourceType,
        localPath,
        repoName,
        repoOwner,
        fileId
    })
}

module.exports = RegisterNewSourceCommand