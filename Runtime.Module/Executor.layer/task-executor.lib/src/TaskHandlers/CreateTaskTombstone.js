const TaskStatusTypes = require("../TaskStatusTypes")

// Lápide de uma task encerrada.
//
// O problema: `taskList` só cresce (CreateTaskStateManager faz `push`, nunca
// remove — e não PODE remover, porque `taskId` é o índice do array e qualquer
// splice renumeraria todas as tasks vivas). Uma task encerrada continuava
// segurando:
//
//   - `params`          : parâmetros JÁ RESOLVIDOS, onde moram os handles de
//                         outras tasks (nodejsPackageHandler, serverService, os
//                         handles de componentLibraries). É o que ancora, por
//                         transitividade, o compilador webpack de um webgui;
//   - `getServiceObject`: a closure devolvida pelo loader, que fecha sobre todo
//                         o estado interno dele;
//   - `executorChannel` : um EventEmitter com listeners de START/STOP/CHANGE
//                         registrados pelo loader e pelo executor.
//
// Num daemon que fica meses no ar, cada instância que sobe e desce deixa esse
// conjunto para trás. A lápide substitui a task NO MESMO ÍNDICE, preservando
// exatamente o que ainda é lido depois do fim — o painel de execução mostra
// tasks encerradas, e `FindTaskByQuery`/`IsTaskActivatable` navegam a lista
// inteira — e soltando o resto.
//
// Ver FormatTaskForOutput.js e GetTaskInformation.js (utilities.lib): são eles
// que definem o que a interface enxerga de uma task.

// Só tasks encerradas de vez. `FINISHED` fica de fora de propósito: uma task
// `nodejs-package` termina em FINISHED e o seu `getServiceObject` continua sendo
// consumido pelas tasks de endpoint que dependem dela (ver GetTaskServiceObject).
const PURGEABLE_STATUS = [
    TaskStatusTypes.TERMINATED,
    TaskStatusTypes.FAILURE
]

const IsPurgeable = (task) =>
    !!task && !task.purgedAt && PURGEABLE_STATUS.includes(task.status)

const CreateTaskTombstone = (task) => {

    const {
        taskId,
        pTaskId,
        objectLoaderType,
        status,
        statusReason,
        hasChildTasks,
        // Estes quatro são declaração (JSON vindo dos metadados), não estado
        // vivo: são leves e a interface os exibe. Ficam.
        staticParameters,
        linkedParameters,
        agentLinkRules,
        activationRules,
        children,
        executorChannel
    } = task

    // Sem isto, os listeners registrados pelo loader mantêm vivas as closures do
    // loader mesmo depois de o EventEmitter ficar inalcançável pela task.
    if(executorChannel && typeof executorChannel.removeAllListeners === "function")
        executorChannel.removeAllListeners()

    return {
        taskId,
        ...pTaskId !== undefined ? { pTaskId } : {},
        objectLoaderType,
        status,
        ...statusReason ? { statusReason } : {},
        ...hasChildTasks !== undefined ? { hasChildTasks } : {},
        ...staticParameters ? { staticParameters } : {},
        ...linkedParameters ? { linkedParameters } : {},
        ...agentLinkRules ? { agentLinkRules } : {},
        ...activationRules ? { activationRules } : {},
        ...children ? { children } : {},

        // Marca a lápide. A interface pode distinguir "encerrada" de "encerrada e
        // liberada", e `IsPurgeable` não repurga o que já foi purgado.
        purgedAt: new Date().toISOString(),

        // Em vez de sumir com o campo, deixamos um substituto que EXPLICA. Se
        // alguma task viva tentar resolver o serviço de uma task já encerrada,
        // o erro aponta a causa em vez de estourar um "getServiceObject is not
        // a function" a três saltos de distância.
        getServiceObject: () => {
            throw new Error(
                `A task ${taskId} (${objectLoaderType}) já foi encerrada e seus recursos foram liberados; ` +
                `não há serviço a resolver.`
            )
        }
    }
}

CreateTaskTombstone.IsPurgeable      = IsPurgeable
CreateTaskTombstone.PURGEABLE_STATUS = PURGEABLE_STATUS

module.exports = CreateTaskTombstone
