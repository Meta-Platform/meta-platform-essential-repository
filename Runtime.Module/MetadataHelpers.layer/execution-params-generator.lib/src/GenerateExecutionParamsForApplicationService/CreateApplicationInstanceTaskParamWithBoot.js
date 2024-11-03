const CheckIfHaveExecutables = require("./CheckIfHaveExecutables")
const GenerateDefaultApplicationTaskParam = require("./GenerateDefaultApplicationTaskParam")
const GenerateCommandApplicarionTaskParam = require("./GenerateCommandApplicarionTaskParam")

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
        ? GenerateCommandApplicarionTaskParam({
                startupParams,
                namespace,
                rootPath,
                bootMetadata,
                executableName,
                commandLineArgs
            })
        : GenerateDefaultApplicationTaskParam({
                startupParams,
                namespace,
                rootPath,
                bootMetadata,
                metadataHierarchy
            })

    return taskParam
}



module.exports = CreateApplicationInstanceTaskParamWithBoot