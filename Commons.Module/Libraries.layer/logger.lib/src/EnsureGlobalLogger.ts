/*
 * Garante que `globalThis.Log` EXISTA, sem prometer que seja o logger canônico.
 *
 * Por que existe: o resto do ecossistema chama `Log.info(...)` diretamente, sem
 * `require` e sem guarda — é o contrato do logger global. Só que quem instala o
 * global é `InstallGlobalLogger`, e há caminhos em que ele ainda NÃO rodou:
 *
 *   - a árvore de INSTALAÇÃO (`ecosystem-install-utilities.lib`), que executa
 *     justamente para o ecossistema passar a existir;
 *   - binários que carregam libs por LoaderScript antes do bootstrap completo
 *     (mywizard, package-executor);
 *   - um EssentialRepo instalado anterior à `logger.lib`.
 *
 * Nesses caminhos, `Log.info` lança `ReferenceError: Log is not defined`. Quando
 * isso acontece dentro de um `catch`, o erro original é SUBSTITUÍDO pelo
 * ReferenceError e a causa real desaparece — foi o que travou o provisionamento
 * da plataforma em 29/07/2026 (VDRP-252, VDRP-268, VDRP-275): builds morriam com
 * "Log is not defined" e o motivo verdadeiro nunca era impresso.
 *
 * O logger instalado aqui é deliberadamente pobre: escreve no console e nada
 * mais. Ele é marcado como `minimal` para que `InstallGlobalLogger` o substitua
 * pelo canônico (com sink de arquivo, rotação e retenção) assim que o
 * ecossistema existir — a mesma marca que aquele módulo já procura.
 *
 * Idempotente: se já houver logger — mínimo ou canônico — devolve o que está lá.
 */

/*
 * Os níveis vêm de Levels.js, não de uma lista escrita aqui: um nível novo
 * (ou renomeado) lá tem de existir neste logger também, senão `Log.<nivel>`
 * volta a ser `undefined` — exatamente a classe de erro que este módulo evita.
 */
import type { Logger, LogLevel } from "../types/Logger"

const { LEVELS } = require("./Levels")

/* O escopo global visto como dicionário — é assim que o logger é instalado e
 * consultado por quem não o importa. Como uma variável, e não como
 * `(globalThis as any)` no meio do código: neste repositório não há ponto e
 * vírgula, e uma linha que começa com parêntese é lida como chamada da linha
 * anterior. */
const globalScope = globalThis as any

const GLOBAL_KEY  = "Log"
const GLOBAL_MARK = Symbol.for("meta-platform.logger.globalLogger")

const NIVEIS = LEVELS

/*
 * Escreve no stream que couber. `error`/`fatal` vão para o stderr, para
 * sobreviverem a um stdout redirecionado — e é o stderr que o build do Docker
 * mostra quando um passo falha.
 */
const Escrever = (nivel: LogLevel, origem: unknown, argumentos: any[]) => {

    const partes = argumentos.map((a: any) =>
        (a && a.stack) ? a.stack : (typeof a === "object" ? JSON.stringify(a) : String(a)))

    const linha = `[${origem}] ${partes.join(" ")}\n`

    try {
        const stream = (nivel === "error" || nivel === "fatal")
            ? process.stderr
            : process.stdout

        stream.write(linha)
    } catch (error) {
        /* sem stream não há para onde ir; engolir é melhor que derrubar */
    }
}

const CriarLoggerMinimo = (): Logger => {

    const logger: any = {}

    NIVEIS.forEach((nivel: LogLevel) => {
        logger[nivel] = (origem: unknown, ...argumentos: unknown[]) => Escrever(nivel, origem, argumentos)
    })

    /* Superfície mínima que o canônico oferece e que o ecossistema pode chamar. */
    logger.minimal         = true
    logger.FlushSync       = () => {}
    logger.OpenFileChannel = () => {
        const canal: any = {}
        NIVEIS.forEach((nivel: LogLevel) => { canal[nivel] = () => {} })
        canal.Close = async () => {}
        return canal
    }

    return logger
}

const EnsureGlobalLogger = (): Logger => {

    if (globalScope[GLOBAL_KEY]) {
        return globalScope[GLOBAL_KEY]
    }

    const logger = CriarLoggerMinimo()

    globalScope[GLOBAL_KEY] = logger

    /*
     * A marca precisa dizer `minimal: true` e trazer os dois desmontadores que
     * `UninstallGlobalLogger` chama — senão a troca pelo logger canônico
     * quebraria ao tentar desinstalar este.
     */
    Object.defineProperty(globalScope, GLOBAL_MARK, {
        value        : {
            minimal            : true,
            UninstallBridge    : () => {},
            UnregisterExitFlush: () => {}
        },
        configurable : true,
        enumerable   : false,
        writable     : false
    })

    return logger
}

module.exports = EnsureGlobalLogger
module.exports.EnsureGlobalLogger = EnsureGlobalLogger
