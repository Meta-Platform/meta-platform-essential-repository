const TaskStatusTypes = require("../../../Executor.layer/task-executor.lib/src/TaskStatusTypes")
const SmartRequire = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")
const yargs = SmartRequire('yargs/yargs')

const CommandApplicationTaskLoader = (loaderParams, executorCommandChannel) => {

    const {
        startupParams,
        executables,
        executableName,
        commandLineArgs,
        nodejsPackageHandler
    } = loaderParams

    const _GetExecutableDataByName = (name) => 
        executables.find(({executableName}) => executableName === name)

    const _GetCommandGroupData = (executableName) => {
        const executableData = _GetExecutableDataByName(executableName)
        return nodejsPackageHandler.require(executableData.commands)
    }
    
    const _GetCommandFunction = (path) => path && nodejsPackageHandler.require(path)

    const _GetCommandHandler = (path) => {
        if (path) {
            const CommandFunction = _GetCommandFunction(path)
            return CommandFunction 
                ? (args) => CommandFunction(args)
                : (args) => {}
        } else {
            return (args) => {}
        }
    }

    const _BuiderParameter = (_yargs, param) => {
        const {
            key,
            paramType,
            valueType,
            describe
        } = param
        _yargs[paramType](key, {describe, type:valueType})
    }

    const _GetCommandBuilder = ({parameters, childCommands}) => {
        return (_yargs) => {
            parameters?.forEach(param => _BuiderParameter(_yargs, param))
            childCommands?.forEach(childCommandData => {
                const childCommandModule = _ConfigCommand(childCommandData)
                _yargs.command(childCommandModule)
            })
        }
    }

    const _ConfigCommand = (commandData) => {
        const {
            path,
            command,
            parameters,
            childCommands,
            description = ''
        } = commandData

        if (!command) {
            throw new Error('O campo "command" é obrigatório.')
        }

        const handler = _GetCommandHandler(path)
        const builder = _GetCommandBuilder({parameters, childCommands})

        const commandModule = {
            command,
            describe: description,
            builder,
            handler
        }

        return commandModule
    }

    const _ExecuteCommand = (commadGroupData, commandLineArgs) => {
        const _yargs = yargs(commandLineArgs)

        commadGroupData.forEach(commandData => {
            const commandModule = _ConfigCommand(commandData)
            _yargs.command(commandModule)
        })

        const mainCommandData = commadGroupData.find(({ isMainCommand }) => isMainCommand)
        if (mainCommandData) {
            const {
                path
            } = mainCommandData
            const CommandFunction = _GetCommandFunction(path)
            CommandFunction()
        }

        _yargs.argv
    }

    const Start = () => {
        executorCommandChannel.emit("status", TaskStatusTypes.STARTING)
        
        try {
            const commadGroupData = _GetCommandGroupData(executableName)
            _ExecuteCommand(commadGroupData, commandLineArgs)
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
