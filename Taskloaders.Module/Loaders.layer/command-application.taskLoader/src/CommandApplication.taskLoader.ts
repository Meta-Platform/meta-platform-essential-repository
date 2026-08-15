import type { CommandLoaderParams } from "./Types"

const TaskStatusTypes          = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/TaskStatusTypes")
const CommandChannelEventTypes = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/CommandChannelEventTypes")

const ExecuteCommand = require("./ExecuteCommand") as (loaderParams: CommandLoaderParams) => Promise<boolean>

/**
 * Object loader de aplicação de linha de comando: dá ciclo de vida a um `.cli`.
 *
 * Só isso — montar os comandos é do ConfigCommand, executá-los é do
 * ExecuteCommand. Aqui ficam o estado da task e o código de saída do processo.
 */
const CommandApplicationTaskLoader = (loaderParams: CommandLoaderParams, executorChannel: any) => {
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
