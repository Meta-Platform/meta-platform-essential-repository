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

/** A supervisão de uma instância, vista de fora. */
export type CommunicationInterface = {
    GetLogStreaming: () => EventStream
    GetEventChangeListener: () => EventStream
    KillInstance: () => Promise<string>
    GetStatus: () => Promise<string>
    ListTasks: () => Promise<Task[]>
    GetTask: (taskId: number) => Promise<Task>
    GetStartupArguments: () => Promise<any>
    GetProcessInformation: () => Promise<any>
}
