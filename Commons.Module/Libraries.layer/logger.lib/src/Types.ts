import type { LogLevel, Logger, LogSink, LogRecord } from "../types/Logger"

/**
 * Tipos internos da logger.lib. O contrato público — o que `Log` oferece a
 * quem escreve log — vive em `types/Logger.d.ts`; aqui está o que só interessa
 * a quem constrói o logger.
 */

/** Carimbo do processo, acrescentado a todo registro. */
export type LogContext = {
    origin?: string
    package?: string | null
    instanceId?: string | null
    [field: string]: unknown
}

/* O registro é contrato público — vive em types/Logger.d.ts e é reexportado
 * aqui, para quem constrói o logger encontrá-lo junto do resto. */
export type { LogRecord }

/** Sink com destino declarado — é o que permite os dois pisos independentes. */
export type TargetedSink = LogSink & {
    target?: "console" | "file" | string
}

/** O sink de arquivo conta o que não conseguiu escrever — linha perdida é
 * informação, não silêncio. */
export type JsonlSink = TargetedSink & {
    GetDiscardedLineCount: () => number
}

/**
 * O `console` visto como objeto manipulável. A ponte troca métodos pelo nome e
 * marca o objeto com um Symbol — duas coisas que o tipo `Console` publicado não
 * descreve, embora sejam exatamente o que a ponte precisa fazer.
 */
export type BridgeableConsole = Console & Record<string | symbol, any>

/** Para um evento, quais destinos o recebem. */
export type LogTargets = {
    console: boolean
    file: boolean
}

export type CreateLoggerParams = {
    context?: LogContext
    sinks?: TargetedSink[]
    level?: unknown
    consoleLevel?: unknown
    boundSource?: string | null
}

/** A chamada desembrulhada: o que o usuário quis dizer com os argumentos. */
export type ResolvedCall = {
    source: string
    message: string
    data: unknown
}

export type CreateLoggerFn = (params?: CreateLoggerParams) => Logger

/**
 * O que o ponto de entrada informa ao instalar o logger do processo: quem é
 * (`origin`, `package`, `instanceId`), onde escreve (`logsDirPath`) e com que
 * pisos. `force` existe para o teste e para a troca do logger mínimo pelo
 * canônico.
 */
export type InstallGlobalLoggerParams = {
    origin?: string
    package?: string | null
    instanceId?: string | null
    context?: LogContext
    logsDirPath?: string | null
    fileName?: string | null
    level?: unknown
    consoleLevel?: unknown
    maxFileSizeMb?: unknown
    retentionDays?: unknown
    stream?: NodeJS.WritableStream
    bridgeConsole?: boolean
    disableConsoleSink?: boolean
    disableFileSink?: boolean
    force?: boolean
}
