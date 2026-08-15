/**
 * Contratos do task-table-render.lib.
 *
 * A tabela vem do `cli-table3`, resolvido em tempo de execução pelo
 * SmartRequire — não há tipo publicado chegando junto. O que está aqui é o
 * contrato do que a lib de fato usa dela: empilhar linha e virar texto.
 */

import type { TaskStatus } from "../../../../Runtime.Module/Executor.layer/task-executor.lib/types/Task"

/** Nome de cor do `colors` — o mesmo vocabulário do pacote. */
export type ColorName =
    | "gray"
    | "blue"
    | "yellow"
    | "bgYellow"
    | "bgGreen"
    | "green"
    | "bgRed"
    | "red"

/** Célula com apresentação própria (alinhamento, mesclagem). */
export type TableCell = {
    content: string
    hAlign?: "left" | "center" | "right"
    vAlign?: "top" | "center" | "bottom"
    colSpan?: number
    rowSpan?: number
}

export type TableRow = (string | number | TableCell | undefined)[]

export type AttributeTable = {
    push: (row: TableRow) => void
    toString: () => string
}

export type TableDimensions = {
    colWidths: number[]
    wordWrap?: boolean
}

/*
 * Assinaturas dos módulos do pacote.
 *
 * Um `require` devolve `any` — o TypeScript não atravessa a fronteira do
 * CommonJS. Declarando a assinatura aqui, o dono do módulo a cumpre e quem
 * requer a afirma: mudou de um lado, quebra no outro. Sem isto, cada arquivo
 * ficaria verificado por dentro e cego nas bordas.
 */

export type GetColorLogByStatusFn = (status: TaskStatus) => ColorName

export type CreateAttributeTableFn = (dimensions: TableDimensions) => AttributeTable
