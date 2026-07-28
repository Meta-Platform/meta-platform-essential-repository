#!/usr/bin/env node
/*
 * LOGS-73 — Lint anti-regressão do log.
 *
 * Falha (exit 1) se voltar a aparecer, em código do ecossistema:
 *
 *   - `console.log/error/warn/info/debug` — o padrão é `Log.<nivel>(source, msg)`;
 *   - `loggerEmitter` — o log não viaja mais como parâmetro;
 *   - uma nova cópia do formatador (`PrintDataLog`, `FormatterDataLog`).
 *
 * O projeto LOGS eliminou 344 `loggerEmitter`, 5 cópias do formatador e
 * ~250 `console.*`. Sem esta trava, o padrão volta a se dissolver do mesmo
 * jeito que se dissolveu antes — um `console.log` de cada vez.
 *
 * Rodar a partir da raiz do meta-platform-repo.
 * Ver: meta-platform-open-standard/specifications/logging-standard.md
 */

const { execSync } = require("child_process")
const fs   = require("fs")
const path = require("path")

const ROOT = path.resolve(__dirname, "../../../../../..")

/*
 * O que está FORA do escopo, e por quê. Não é dívida: é o certo.
 *
 *   - a própria logger.lib e a cópia mínima do cli-script-loader escrevem no
 *     stdout por projeto — são a implementação do log;
 *   - `scripts/` e `tools/` são utilitários standalone, rodados por `node` fora
 *     do ecossistema: ali `globalThis.Log` não existe;
 *   - `test/`, `tests/` e `*.test.js` capturam `console` de propósito;
 *   - os dois `SmartRequire` são carregados DURANTE a construção do logger —
 *     usar `Log` ali seria circular;
 *   - o servidor MCP tem o stdout como canal do protocolo;
 *   - `dist/` e `build/` são artefato, não fonte.
 */
const PERMITIDOS = [
    /logger\.lib\//,
    /MinimalLogger\.js$/,
    /\/scripts\//,
    /\/tools\//,
    /\/tests?\//,
    /\.test\.js$/,
    /\/test\.js$/,          // `npm test` do laboratório de nativos: roda fora do ecossistema (LOGS-45)
    /SmartRequire\.js$/,
    /meta-project-manager-mcp\.cli\//,
    /cli\.harness\.js$/,
    /\/dist\//,
    /\/build\//,
    /\/node_modules\//,
    /\/@@\//
]

const REGRAS = [
    { nome : "console.*",      padrao : /(^|[^.\w])console\.(log|error|warn|info|debug)\s*\(/ },
    { nome : "loggerEmitter",  padrao : /\bloggerEmitter\b/ },
    { nome : "cópia do formatador", padrao : /\b(PrintDataLog|FormatterDataLog|CreatePrintDataLog)\b/ }
]

const EhPermitido = (arquivo) => PERMITIDOS.some((padrao) => padrao.test(arquivo))

/* Ignora ocorrência dentro de comentário: a doc explica o padrão antigo. */
const EhComentario = (linha) => /^\s*(\/\/|\*|\/\*)/.test(linha)

let arquivos
try {
    arquivos = execSync(
        `find repos Meta-Platform -name '*.js' -not -path '*/node_modules/*' -not -path '*/.git/*'`,
        { cwd : ROOT, maxBuffer : 32 * 1024 * 1024 }
    ).toString().trim().split("\n").filter(Boolean)
} catch (e) {
    console.error("Falha ao listar arquivos:", e.message)
    process.exit(2)
}

const infracoes = []

for (const relativo of arquivos) {

    if (EhPermitido(relativo)) continue

    let conteudo
    try { conteudo = fs.readFileSync(path.join(ROOT, relativo), "utf8") } catch (e) { continue }

    /*
     * Blocos `/* … *\/` precisam ser rastreados linha a linha: código antigo
     * comentado é justamente onde o padrão velho sobrevive, e apontá-lo seria
     * falso positivo.
     */
    let dentroDeBloco = false

    conteudo.split("\n").forEach((linha, indice) => {

        const abre  = linha.lastIndexOf("/*")
        const fecha = linha.lastIndexOf("*/")

        const jaEstavaEmBloco = dentroDeBloco

        if (!dentroDeBloco && abre !== -1 && (fecha === -1 || fecha < abre)) dentroDeBloco = true
        else if (dentroDeBloco && fecha !== -1 && (abre === -1 || abre < fecha)) dentroDeBloco = false

        if (jaEstavaEmBloco || dentroDeBloco) return

        if (EhComentario(linha)) return

        for (const regra of REGRAS) {
            if (regra.padrao.test(linha)) {
                infracoes.push({ arquivo : relativo, linha : indice + 1, regra : regra.nome, texto : linha.trim().slice(0, 90) })
                break
            }
        }
    })
}

if (infracoes.length) {
    infracoes.forEach((i) => console.error(`[${i.regra}] ${i.arquivo}:${i.linha}\n            ${i.texto}`))
    console.error(`\nFALHA: ${infracoes.length} ocorrência(s). Use \`Log.<nivel>(source, mensagem)\` — ver logging-standard.md.`)
    process.exit(1)
}

console.log(`OK: ${arquivos.length} arquivos verificados, nenhum console.*, loggerEmitter ou cópia de formatador fora do permitido.`)
