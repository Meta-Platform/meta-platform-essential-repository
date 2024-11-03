const TaskStatusTypes = require("../../../Executor.layer/task-executor.lib/src/TaskStatusTypes")
const SmartRequire = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")
const yargs = SmartRequire('yargs/yargs')

//const _GetCommandFunction = (path) => 


const BuiderParameter = (_yargs, param) => {
    const {
        key,
        paramType,
        valueType,
        describe
    } = param
    _yargs[paramType](key, {describe, type:valueType})
}

const GetCommandBuilder = ({parameters, children}) => {
    return (_yargs) => {
        parameters?.forEach(param => BuiderParameter(_yargs, param))
        children?.forEach(childCommandData => {
            const childCommandModule = ConfigCommand(childCommandData)
            _yargs.command(childCommandModule)
        })
    }
}

const GetCommandHandler = ({
    path, 
    startupParams, 
    nodejsPackageHandler
}) => {
    if (path) {
        const CommandFunction = path && nodejsPackageHandler.require(path)
        return CommandFunction 
            ? (args) => CommandFunction({ args, startupParams })
            : (args) => {}
    } else {
        return (args) => {}
    }
}


const ConfigCommand = ({ 
    commandMetadata, 
    startupParams, 
    nodejsPackageHandler
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
        startupParams, 
        nodejsPackageHandler
    })
    const builder = GetCommandBuilder({parameters, children})

    const commandModule = {
        command,
        describe: description,
        builder,
        handler
    }

    return commandModule
}

const ExecuteCommand = ({
    commandsMetadata, 
    commandLineArgs, 
    startupParams, 
    nodejsPackageHandler
}) => {
    const _yargs = yargs(commandLineArgs)

    commandsMetadata.forEach(commandMetadata => {
        const commandModule = ConfigCommand({ 
            commandMetadata, 
            startupParams, 
            nodejsPackageHandler
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

    const {
        startupParams,
        commands,
        commandLineArgs,
        nodejsPackageHandler
    } = loaderParams

    const Start = () => {
        executorCommandChannel.emit("status", TaskStatusTypes.STARTING)
        
        try {

            ExecuteCommand({
                commandsMetadata: commands, 
                commandLineArgs, 
                startupParams, 
                nodejsPackageHandler
            })
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
