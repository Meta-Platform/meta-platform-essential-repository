/**
 * Globais do runtime da plataforma.
 *
 * `Log` não é importado por ninguém: o ponto de entrada do processo o instala em
 * `globalThis`, e a partir daí qualquer arquivo escreve com ele — sem `require`,
 * sem receber logger por parâmetro. Ver logging-standard.md.
 *
 * Esta declaração é o que torna esse acordo visível ao verificador de tipos.
 */

import type { Logger } from "../Commons.Module/Libraries.layer/logger.lib/types/Logger"

declare global {
    // `var`, e não `const`: é o que também descreve `globalThis.Log`, usado por
    // quem INSTALA o logger — e o instalador é justamente a logger.lib.
    var Log: Logger
}

/*
 * O pacote `colors`, quando carregado, ESTENDE `String.prototype` — é o que
 * permite escrever `"texto".red` em vez de `colors.red("texto")`. As duas formas
 * convivem no código do ecossistema; esta declaração é o que torna a segunda
 * visível ao verificador.
 */
declare global {
    interface String {
        readonly black: string
        readonly red: string
        readonly green: string
        readonly yellow: string
        readonly blue: string
        readonly magenta: string
        readonly cyan: string
        readonly white: string
        readonly gray: string
        readonly grey: string
        readonly bold: string
        readonly dim: string
        readonly italic: string
        readonly underline: string
        readonly inverse: string
        readonly bgBlack: string
        readonly bgRed: string
        readonly bgGreen: string
        readonly bgYellow: string
        readonly bgBlue: string
        readonly bgMagenta: string
        readonly bgCyan: string
        readonly bgWhite: string
    }
}

export {}
