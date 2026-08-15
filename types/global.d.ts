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
    const Log: Logger
}

export {}
