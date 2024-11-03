const CheckIfHaveBoot = require("./CheckIfHaveBoot")
const CheckIfHaveExecutables = require("./CheckIfHaveExecutables")
const CreateDefaultApplicationTaskParam = require("./CreateDefaultApplicationTaskParam")
const CreateCommandApplicarionTaskParam = require("./CreateCommandApplicarionTaskParam")

const GenerateExecutionParamsForApplicationService = ({
    metadataHierarchy, 
    executableName,
    commandLineArgs
}) => {

    if(CheckIfHaveBoot(metadataHierarchy) || (CheckIfHaveExecutables(metadataHierarchy) && executableName)){

        const taskParam = CheckIfHaveExecutables(metadataHierarchy) && executableName
        ? CreateCommandApplicarionTaskParam({
                metadataHierarchy,
                executableName,
                commandLineArgs
            })
        : CreateDefaultApplicationTaskParam(metadataHierarchy)

            return taskParam
    }
}

module.exports = GenerateExecutionParamsForApplicationService