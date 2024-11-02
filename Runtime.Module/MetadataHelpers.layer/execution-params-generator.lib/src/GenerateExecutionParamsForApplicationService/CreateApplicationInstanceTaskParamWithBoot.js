const CheckIfHaveExecutables = require("./CheckIfHaveExecutables")
const GetDefaultApplicationTaskParam = require("./GetDefaultApplicationTaskParam")

const GetCommandApplicarionTaskParam = ({
    startupParams,
    namespace,
    rootPath,
    bootMetadata,
    executableName,
    commandLineArgs
}) => {
    return {
        objectLoaderType: "command-application",
        "staticParameters": {
            startupParams,
            namespace,
            executables,
            rootPath,
            executableName,
            commandLineArgs
        },
        "linkedParameters": {
            "nodejsPackageHandler": namespace
        },
        "agentLinkRules":[{
            referenceName: namespace,
            requirement:{
                "&&": [
                    { "property": "params.tag", "=": namespace },
                    { "property": "status", "=": "ACTIVE" }
                ]
            }
        }] 
    }
}

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
        ? GetCommandApplicarionTaskParam({
                startupParams,
                namespace,
                rootPath,
                bootMetadata,
                executableName,
                commandLineArgs
            })
        : GetDefaultApplicationTaskParam({
                startupParams,
                namespace,
                rootPath,
                bootMetadata,
                metadataHierarchy
            })

    return taskParam
}



module.exports = CreateApplicationInstanceTaskParamWithBoot