const TaskStatusTypes          = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/TaskStatusTypes")
const CommandChannelEventTypes = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/CommandChannelEventTypes")

const SmartRequire = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")
const yargs = SmartRequire('yargs/yargs')

const TokenizeArgs = require("./TokenizeArgs")

const FilteredCommandParams = (loaderParams: any, parameterNames: any) => {

    const serviceParams = parameterNames
    .reduce((serviceParamsAcc: any, parameterName: any) => ({ 
        ...serviceParamsAcc, 
        [parameterName]: loaderParams[parameterName] 
    }), {})
    
    return serviceParams

}

const BuiderParameter = (_yargs: any, param: any) => {

    const {
        key,
        paramType,
        valueType,
        describe
    } = param
    _yargs[paramType](key, {describe, type:valueType})

}

const GetCommandBuilder = ({parameters, children, loaderParams}: { parameters: any, children: any, loaderParams: any }) => {

    return async (_yargs: any) => {
        parameters?.forEach((param: any) => BuiderParameter(_yargs, param))

        if(children){
            for(const childCommandData of children){
                const childCommandModule = await ConfigCommand({ 
                    commandMetadata: childCommandData, 
                    loaderParams
                })
                _yargs.command(childCommandModule)
            }
        }

    }

}

const GetCommandHandler = ({
    path, 
    parametersToLoad=[],
    loaderParams
}: {
    path: string
    parametersToLoad: any
    loaderParams: any
}) => {

    if (path) {
        const { 
            startupParams, 
            nodejsPackageHandler, 
            commandParameterNames
         } = loaderParams

        const CommandFunction = path && nodejsPackageHandler.require(path)
        const allParams = FilteredCommandParams(loaderParams, commandParameterNames)
        const params = FilteredCommandParams(allParams, parametersToLoad)

        return CommandFunction 
            ? async (args: any) => await CommandFunction({ args, startupParams, params })
            : (args: any) => {}

    } else {
        return (args: any) => {}
    }

}

const ConfigCommand = async ({
    commandMetadata, 
    loaderParams
}: {
    commandMetadata: any
    loaderParams: any
}) => {

    const {
        path,
        command,
        parameters,
        children,
        description = '',
        parametersToLoad
    } = commandMetadata

    if (!command) {
        throw new Error('O campo "command" é obrigatório.')
    }

    const handler = await GetCommandHandler({
        path,
        parametersToLoad,
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

const ExecuteCommand = async (loaderParams: any) => {

    let isStopAllTasks = true

    const {
        commands: commandsMetadata, 
        commandLineArgs,  
        nodejsPackageHandler
    } = loaderParams

    // O yargs recebe argv já tokenizado: entregar a string crua faria os
    // argumentos posicionais chegarem ao comando com as aspas literais.
    const argv = TokenizeArgs(commandLineArgs)

    const _yargs = yargs(argv)

    for (const commandMetadata of commandsMetadata) {

        const commandModule = await ConfigCommand({ 
            commandMetadata, 
            loaderParams
        })

        const originalHandler = commandModule.handler
        commandModule.handler = async function(args) {
            if(commandMetadata.isNotStopAllTasks){
                isStopAllTasks = false
            }
            return originalHandler(args)
        }

        _yargs.command(commandModule)
    }

    const mainCommandData = commandsMetadata.find(({ isMainCommand }: { isMainCommand: any }) => isMainCommand)
    if (mainCommandData) {
        const {
            path
        } = mainCommandData
        const CommandFunction = path && nodejsPackageHandler.require(path)
        await CommandFunction()
    }
    
    await _yargs.parseAsync(argv)

    return isStopAllTasks
    
}

const CommandApplicationTaskLoader = (loaderParams: any, executorChannel: any) => {
    // Carimba a execução: tudo que este loader registrar sai identificado pela
    // instância e pelo ambiente. Ver logging-standard.md.
    const log = Log
        .child({
            instanceId     : process.env.META_LAUNCH_ID || null,
            environmentPath: loaderParams.environmentPath || null
        })
        .source("CommandApplication")


    const Start = async () => {

        executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.STARTING)

        try {
            const isStopAllTasks = await ExecuteCommand(loaderParams)
            if(isStopAllTasks){
                executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.FINISHED)
                executorChannel.emit(CommandChannelEventTypes.STOP_ALL_TASKS)
            }
        } catch (e) {
            executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.FAILURE)
            log.error("falha ao executar o comando", e)
            /* O comando falhou: quem chamou a CLI de um script precisa saber
             * pelo código de saída, não só pela mensagem no terminal. */
            process.exitCode = 1
        }

    }

    /*
     * `process.exit(0)` fixo descartava o `process.exitCode` que o comando havia
     * definido: uma operação RECUSADA pelo serviço saía com sucesso para o shell,
     * e qualquer automação encadeada com `&&` seguia adiante como se tivesse dado
     * certo. O código de saída passa a ser o que o comando determinou, com 0 como
     * padrão de quem não determinou nada.
     */
    const Stop = () => process.exit(process.exitCode === undefined ? 0 : process.exitCode)
    
    executorChannel.on(CommandChannelEventTypes.START_TASK, Start)
    executorChannel.on(CommandChannelEventTypes.STOP_TASK, Stop)

    return () => {}
}

module.exports = CommandApplicationTaskLoader
