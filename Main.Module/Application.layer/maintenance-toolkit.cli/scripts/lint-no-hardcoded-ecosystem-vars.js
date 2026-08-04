#!/usr/bin/env node
// CFGEC-29 — Lint anti-regressão: falha (exit 1) se qualquer metadata/startup-params.json
// voltar a hardcodar uma variável de ecosystem-defaults.json.
// Essas vars devem ser HERDADAS via injeção do pkg-exec, não copiadas no pacote.
// Rodar na CI a partir da raiz do meta-platform-repo.
const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

// raiz do monorepo = 6 níveis acima deste script
const ROOT = path.resolve(__dirname, "../../../../../..")

// A lista vem do arquivo canônico, não de uma cópia hardcodada aqui.
// Antes ela era literal e dessincronizava a cada chave nova do ecossistema —
// o lint continuava passando enquanto deixava de vigiar as variáveis recentes.
const CANONICAL_DEFAULTS = path.join(
    ROOT,
    "repos/essential-repository/Main.Module/Application.layer/repository-manager.cli/src/Configs/ecosystem-defaults.json"
)

let VARS_DEFAULTS
try {
    VARS_DEFAULTS = new Set(Object.keys(JSON.parse(fs.readFileSync(CANONICAL_DEFAULTS, "utf8"))))
} catch(e) {
    console.error(`Falha ao ler o ecosystem-defaults canônico (${CANONICAL_DEFAULTS}): ${e.message}`)
    process.exit(2)
}
let files
try {
    files = execSync(`find repos -name startup-params.json -not -path '*/node_modules/*'`, { cwd: ROOT }).toString().trim().split("\n").filter(Boolean)
} catch(e) { console.error("Falha ao listar startup-params.json:", e.message); process.exit(2) }

let offenders = 0, total = 0
for (const rel of files) {
    let obj; try { obj = JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8")) } catch(e){ continue }
    const hits = Object.keys(obj).filter(k => VARS_DEFAULTS.has(k))
    if (hits.length) { offenders++; total += hits.length; console.error(`[HARDCODE] ${rel}\n           ${hits.join(", ")}`) }
}
if (offenders) { console.error(`\nFALHA: ${offenders} arquivo(s), ${total} literal(is) das ${VARS_DEFAULTS.size} vars do ecossistema. Remova-os (herança via pkg-exec).`); process.exit(1) }
console.log(`OK: ${files.length} startup-params.json verificados, 0 hardcodes das ${VARS_DEFAULTS.size} vars do ecossistema.`)
