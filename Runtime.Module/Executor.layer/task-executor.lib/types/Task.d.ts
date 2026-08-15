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

/**
 * A tarefa como o executor a mantém em memória, com o que NÃO atravessa
 * fronteira: o canal de comando, o objeto de serviço vivo, os parâmetros já
 * resolvidos. Nada disso é serializável — por isso a `Task` acima, que é o que
 * sai para o supervisor, para o painel e para o log, não os inclui.
 */
export type RuntimeTask = Task & {
    /** Parâmetros resolvidos na ativação, com os handles que o loader precisa. */
    params?: Record<string, any>
    /** Canal por onde o executor comanda a tarefa e ouve a mudança de status. */
    executorChannel?: any
    /** O objeto que o loader publicou — o serviço em si. */
    getServiceObject?: () => any
    hasChildTasks?: boolean
    /** Marca da lápide: quando a tarefa foi esvaziada, preservando a identidade. */
    purgedAt?: string
}
