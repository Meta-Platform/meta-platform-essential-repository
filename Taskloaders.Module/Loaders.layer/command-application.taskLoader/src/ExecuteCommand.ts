import type { CommandLoaderParams, CommandMetadata, CommandModule } from "./Types"

const SmartRequire = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")
const yargs = SmartRequire('yargs/yargs')

const TokenizeArgs = require("./TokenizeArgs") as (commandLineArgs: string) => string[]
const ConfigCommand = require("./ConfigCommand") as (params: { commandMetadata: CommandMetadata, loaderParams: CommandLoaderParams }) => Promise<CommandModule>

/**
 * Roda a aplicação de linha de comando: monta os comandos declarados, executa o
 * comando principal (quando há um) e entrega os argumentos ao yargs.
 *
 * Devolve se as demais tarefas devem parar ao fim — um comando pode declarar
 * `isNotStopAllTasks` para manter a instância viva depois de executar.
 */
const ExecuteCommand = async (loaderParams: CommandLoaderParams): Promise<boolean> => {

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

        const commandModule = await ConfigCommand({ commandMetadata, loaderParams })

        const originalHandler = commandModule.handler
        commandModule.handler = async function(args: any) {
            if(commandMetadata.isNotStopAllTasks){
                isStopAllTasks = false
            }
            return originalHandler(args)
        }

        _yargs.command(commandModule)
    }

    const mainCommandData = commandsMetadata.find(({ isMainCommand }) => isMainCommand)
    if (mainCommandData) {
        const { path } = mainCommandData
        const CommandFunction = path && nodejsPackageHandler.require(path)
        await CommandFunction()
    }

    await _yargs.parseAsync(argv)

    return isStopAllTasks

}

module.exports = ExecuteCommand
