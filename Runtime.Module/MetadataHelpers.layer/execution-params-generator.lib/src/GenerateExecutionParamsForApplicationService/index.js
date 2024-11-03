const CheckIfHaveBoot = require("./CheckIfHaveBoot")
const CheckIfHaveExecutables = require("./CheckIfHaveExecutables")
const CreateDefaultApplicationTaskParam = require("./CreateDefaultApplicationTaskParam")
const CreateCommandApplicationTaskParam = require("./CreateCommandApplicationTaskParam")

const GenerateExecutionParamsForApplicationService = ({
    metadataHierarchy, 
    executableName,
    commandLineArgs
}) => {

    if(CheckIfHaveBoot(metadataHierarchy) || (CheckIfHaveExecutables(metadataHierarchy) && executableName)){

        const taskParam = CheckIfHaveExecutables(metadataHierarchy) && executableName
        ? CreateCommandApplicationTaskParam({
                metadataHierarchy,
                executableName,
                commandLineArgs
            })
        : CreateDefaultApplicationTaskParam(metadataHierarchy)

            return taskParam
    }
}

module.exports = GenerateExecutionParamsForApplicationService