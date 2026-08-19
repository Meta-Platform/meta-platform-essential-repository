import type { Task, TaskStatus } from "../../../../Runtime.Module/Executor.layer/task-executor.lib/types/Task"

/**
 * Contratos do supervisor.lib.
 *
 * O que chega do gRPC não é um objeto comum: vem em `Struct` do protobuf, com o
 * valor embrulhado em `kind`. Os tipos abaixo descrevem esse embrulho e o que
 * sai dele — a interface de supervisão propriamente dita.
 */

export type ProtoValue = {
    kind: string
    [valueByKind: string]: any
}

export type ProtoStruct = {
    fields: Record<string, ProtoValue>
}

export type ProtoList = {
    values: ProtoValue[]
}

/** Tarefa como o gRPC a devolve, antes de desembrulhar os `Struct`. */
export type TaskResponse = {
    taskId: number
    objectLoaderType: string
    status: TaskStatus
    pTaskId?: { value: number }
    staticParameters?: ProtoStruct
    activationRules?: ProtoStruct
    linkedParameters?: ProtoStruct
    agentLinkRules?: { referenceName: string, requirement: ProtoStruct }[]
    [field: string]: any
}

export type ConvertTaskResponseToTaskFn = (taskResponse: TaskResponse) => Task

/** Stream do gRPC — só o que a lib usa dele. */
export type EventStream = {
    on: (event: string, listener: (data: any) => void) => void
}

/**
 * O que o kernel respondeu à conexão de teste contra o arquivo de socket.
 *
 * `REFUSED` é o único veredito POSITIVO de ausência: o arquivo existe e não há
 * listener ligado nele. `INDETERMINATE` cobre tudo o que não se sabe (timeout,
 * permissão negada) e nunca autoriza conclusão nenhuma.
 */
export type SocketConnectionProbe = "ACCEPTED" | "REFUSED" | "MISSING" | "INDETERMINATE"

/**
 * Os fatos observáveis sobre um arquivo de socket. Sem juízo de valor: quem
 * decide o que fazer com eles é a política de supervisão, não a inspeção.
 *
 * `listening` é `undefined` quando a plataforma não expõe `/proc/net/unix` —
 * "não sei" é um terceiro estado, e confundi-lo com `false` seria exatamente o
 * erro que apaga o socket de uma instância viva.
 */
export type SocketInspection = {
    socketFilePath : string
    exists         : boolean
    isSocket       : boolean
    fileInode     ?: number
    ageMs         ?: number
    listening     ?: boolean
    socketInode   ?: number
    listenerPid   ?: number
    listenerAlive ?: boolean
    connection     : SocketConnectionProbe
    evidence       : string
}

/** A supervisão de uma instância, vista de fora. */
export type CommunicationInterface = {
    /**
     * Fecha o canal gRPC. Obrigatório para quem guarda o cliente: o canal tem
     * timers próprios e não é recolhido só por perder a referência.
     */
    Close: () => void
    GetLogStreaming: () => EventStream
    GetEventChangeListener: () => EventStream
    KillInstance: () => Promise<string>
    GetStatus: () => Promise<string>
    ListTasks: () => Promise<Task[]>
    GetTask: (taskId: number) => Promise<Task>
    GetStartupArguments: () => Promise<any>
    GetProcessInformation: () => Promise<any>
}
