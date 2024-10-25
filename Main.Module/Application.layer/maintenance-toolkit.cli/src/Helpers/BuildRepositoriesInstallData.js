const BuildRepositoriesInstallData = ({ repositoriesToInstall, sources }) => 
    repositoriesToInstall
        .map((repositoryToInstall) => {
            const { 
                namespace,
                sourceType,
                executablesToInstall 
            } = repositoryToInstall

            const sourceData = sources[namespace].find((sourceData) => sourceData.sourceType === sourceType)

            return {
                namespace,
                sourceData,
                executablesToInstall
            }
        })

module.exports = BuildRepositoriesInstallData