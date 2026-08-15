/**
 * Contrato da tarefa, em tipos.
 *
 * Mora na lib que a define e a executa. Quem só consome tarefa — renderizador de
 * tabela, formatador de saída, painel — importa daqui em vez de redescrever a
 * forma, que é como duas noções de "task" acabam divergindo.
 */

export type TaskStatus =
    | "AWAITING_PRECONDITIONS"
    | "PRECONDITIONS_COMPLETED"
    | "PREPPED_TO_START"
    | "STARTING"
    | "STOPPING"
    | "ACTIVE"
    | "FINISHED"
    | "FAILURE"
    | "TERMINATED"

/** Parâmetros literais do nó, vindos dos metadados do package. */
export type StaticParameters = Record<string, any>

/** Parâmetros que chegam de outra tarefa, resolvidos na ativação. */
export type LinkedParameters = Record<string, unknown>

/** Comparação sobre uma propriedade: `{ property, <operador>: valor }`. */
export type Rule = { property: string } & Record<string, unknown>

/** Regras agrupadas por operador booleano (`and`, `or`). */
export type RuleSet = Record<string, Rule[]>

export type AgentLinkRule = {
    referenceName: string
    requirement: RuleSet
}

export type Task = {
    taskId: number
    pTaskId?: number
    objectLoaderType: string
    status: TaskStatus
    statusReason?: string
    staticParameters: StaticParameters
    linkedParameters?: LinkedParameters
    agentLinkRules?: AgentLinkRule[]
    activationRules?: RuleSet
    children?: Task[]
}

/** Tarefa como sai de `GetTaskInformation` — achatada para exibição. */
export type TaskInformation = {
    taskId: number
    status: TaskStatus
    statusReason?: string
    pTaskId?: number
    hasChildTasks: boolean
    objectLoaderType: string
    staticParameters?: StaticParameters
    linkedParameters?: LinkedParameters
    agentLinkRules?: AgentLinkRule[]
    activationRules?: RuleSet
}
