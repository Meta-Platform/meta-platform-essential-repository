const BuildRepositoriesInstallData = ({ repositoriesToInstall, sources }: { repositoriesToInstall: any, sources: any }) => 
    repositoriesToInstall
        .map((repositoryToInstall: any) => {
            const { 
                namespace,
                sourceType,
                executablesToInstall 
            } = repositoryToInstall

            const sourceData = sources[namespace].find((sourceData: any) => sourceData.sourceType === sourceType)

            return {
                namespace,
                sourceData,
                executablesToInstall
            }
        })

module.exports = BuildRepositoriesInstallData