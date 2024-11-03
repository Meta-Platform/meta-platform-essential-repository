const TaskStatusTypes = require("../../../Executor.layer/task-executor.lib/src/TaskStatusTypes")
const SmartRequire = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")
const yargs = SmartRequire('yargs/yargs')

const GetCommandParams = (loaderParams, parameterNames) => {

    const serviceParams = parameterNames
    .reduce((serviceParamsAcc, parameterName) => ({ 
        ...serviceParamsAcc, 
        [parameterName]: loaderParams[parameterName] 
    }), {})
    
    return serviceParams

}

const BuiderParameter = (_yargs, param) => {

    const {
        key,
        paramType,
        valueType,
        describe
    } = param
    _yargs[paramType](key, {describe, type:valueType})

}

const GetCommandBuilder = ({parameters, children, loaderParams}) => {

    return (_yargs) => {
        parameters?.forEach(param => BuiderParameter(_yargs, param))
        children?.forEach(childCommandData => {
            const childCommandModule = ConfigCommand({ 
                commandMetadata: childCommandData, 
                loaderParams
            })
            _yargs.command(childCommandModule)
        })
    }

}

const GetCommandHandler = ({
    path, 
    loaderParams
}) => {

    if (path) {
        const { 
            startupParams, 
            nodejsPackageHandler, 
            commandParameterNames

         } = loaderParams

        const CommandFunction = path && nodejsPackageHandler.require(path)
        const params = GetCommandParams(loaderParams, commandParameterNames)

        return CommandFunction 
            ? (args) => CommandFunction({ args, startupParams, params })
            : (args) => {}

    } else {
        return (args) => {}
    }

}

const ConfigCommand = ({ 
    commandMetadata, 
    loaderParams
}) => {

    const {
        path,
        command,
        parameters,
        children,
        description = ''
    } = commandMetadata

    if (!command) {
        throw new Error('O campo "command" é obrigatório.')
    }

    const handler = GetCommandHandler({
        path, 
        loaderParams
    })
    
    const builder = GetCommandBuilder({parameters, children, loaderParams})

    const commandModule = {
        command,
        describe: description,
        builder,
        handler
    }

    return commandModule
}

const ExecuteCommand = (loaderParams) => {

    const {
        commands: commandsMetadata, 
        commandLineArgs,  
        nodejsPackageHandler
    } = loaderParams

    const _yargs = yargs(commandLineArgs)

    commandsMetadata.forEach(commandMetadata => {
        const commandModule = ConfigCommand({ 
            commandMetadata, 
            loaderParams
        })
        _yargs.command(commandModule)
    })

    const mainCommandData = commandsMetadata.find(({ isMainCommand }) => isMainCommand)
    if (mainCommandData) {
        const {
            path
        } = mainCommandData
        const CommandFunction = path && nodejsPackageHandler.require(path)
        CommandFunction()
    }
    _yargs.argv
}

const CommandApplicationTaskLoader = (loaderParams, executorCommandChannel) => {

    const Start = () => {

        executorCommandChannel.emit("status", TaskStatusTypes.STARTING)

        try {
            ExecuteCommand(loaderParams)
            executorCommandChannel.emit("status", TaskStatusTypes.FINISHED)
        } catch (e) {
            executorCommandChannel.emit("status", TaskStatusTypes.FAILURE)
            console.error(e)
        }

    }
        
    const Stop = () => {
        console.log("CommandApplicationTaskLoader PAROU")
    }
    
    executorCommandChannel.on("start", Start)
    executorCommandChannel.on("stop", Stop)

    return () => {}
}

module.exports = CommandApplicationTaskLoader
