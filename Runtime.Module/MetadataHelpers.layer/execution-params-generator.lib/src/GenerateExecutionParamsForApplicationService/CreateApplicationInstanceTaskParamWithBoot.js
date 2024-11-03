const CheckIfHaveExecutables = require("./CheckIfHaveExecutables")
const CreateDefaultApplicationTaskParam = require("./CreateDefaultApplicationTaskParam")
const CreateCommandApplicarionTaskParam = require("./CreateCommandApplicarionTaskParam")

const CreateApplicationInstanceTaskParamWithBoot = ({
    startupParams,
    namespace,
    rootPath,
    bootMetadata,
    metadataHierarchy,
    executableName,
    commandLineArgs
}) => {

    const taskParam = CheckIfHaveExecutables(metadataHierarchy) && executableName
        ? CreateCommandApplicarionTaskParam({
                startupParams,
                namespace,
                rootPath,
                bootCommandGroupMetadata:bootMetadata.executables,
                executableName,
                commandLineArgs
            })
        : CreateDefaultApplicationTaskParam({
                startupParams,
                namespace,
                rootPath,
                bootMetadata,
                metadataHierarchy
            })

    return taskParam
}



module.exports = CreateApplicationInstanceTaskParamWithBoot