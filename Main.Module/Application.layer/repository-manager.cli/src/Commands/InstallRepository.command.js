const InstallRepositoryCommand = async ({ args }) => {

    const { 
        repositoryName,
        sourceType 
    } = args
    

    console.log(repositoryName, sourceType)
    
}

module.exports = InstallRepositoryCommand