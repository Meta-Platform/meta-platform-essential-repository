const CreateCommandApplicarionTaskParam = ({
    startupParams,
    namespace,
    rootPath,
    bootMetadata,
    executableName,
    commandLineArgs
}) => {
    debugger
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


module.exports = CreateCommandApplicarionTaskParam