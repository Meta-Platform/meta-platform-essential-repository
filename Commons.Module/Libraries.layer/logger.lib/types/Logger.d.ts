/**
 * Contrato do logger da plataforma, em tipos.
 *
 * Espelha o Logging Standard — sete níveis, `source` amarrado, `child` com
 * contexto. Mora aqui, na lib que o implementa, e não junto da declaração
 * global: quem define o contrato é quem o cumpre.
 */

export type LogLevel =
    | "trace"
    | "debug"
    | "info"
    | "message"
    | "warn"
    | "error"
    | "fatal"

/** Dado estruturado que acompanha o registro. Erro é aceito e serializado. */
export type LogData = unknown

export type LogEmitter = {
    /** Forma canônica: origem, mensagem e, opcionalmente, dado estruturado. */
    (source: string, message: unknown, data?: LogData): void
    /** Forma curta, quando a origem já vem amarrada por `source()`. */
    (message: unknown): void
}

export type LogSink = {
    Write: (record: unknown) => void
    Flush?: () => Promise<void>
    FlushSync?: () => void
    Close?: () => Promise<void>
}

export type Logger =
    { [level in LogLevel]: LogEmitter } & {
        /** Mesmo logger, com a origem amarrada. */
        source: (sourceName: string) => Logger
        /** Mesmo logger, com contexto acrescentado. */
        child: (childContext?: Record<string, unknown>) => Logger

        AddSink: (sink: LogSink) => () => void
        RemoveSink: (sink: LogSink) => void

        GetContext: () => Record<string, unknown>
        GetConfiguration: () => Record<string, unknown>

        SetLevel: (level: LogLevel) => void
        SetConsoleLevel: (level: LogLevel) => void

        Flush: () => Promise<void>
        FlushSync: () => void
        Close: () => Promise<void>

        /** Canal de arquivo próprio — usado por quem escreve log de instância. */
        OpenFileChannel: (options?: {
            dirPath?: string
            fileName?: string
            context?: Record<string, unknown>
            level?: LogLevel
        }) => Logger

        /** Marca do logger de emergência: presente só quando o canônico falhou. */
        minimal?: boolean
    }
