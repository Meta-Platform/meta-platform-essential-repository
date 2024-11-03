const CheckIfHaveExecutables = require("./CheckIfHaveExecutables")
const GenerateDefaultApplicationTaskParam = require("./GenerateDefaultApplicationTaskParam")

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
            rootPath,
            executables: bootMetadata.executables,
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