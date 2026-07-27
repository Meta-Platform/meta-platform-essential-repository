#!/usr/bin/env node
// CFGEC-29 — Lint anti-regressão: falha (exit 1) se qualquer metadata/startup-params.json
// voltar a hardcodar uma das 21 variáveis de ecosystem-defaults.json.
// Essas vars devem ser HERDADAS via injeção do pkg-exec, não copiadas no pacote.
// Rodar na CI a partir da raiz do meta-platform-repo.
const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

const VARS_DEFAULTS = new Set(["REPOS_CONF_FILENAME_SOURCE_DATA","REPOS_CONF_FILENAME_REPOS_DATA","REPOS_CONF_EXT_MODULE_DIR","REPOS_CONF_EXT_LAYER_DIR","REPOS_CONF_EXT_GROUP_DIR","REPOS_CONF_EXTLIST_PKG_TYPE","REPOS_CONF_DIRNAME_METADATA","PKG_CONF_DIRNAME_METADATA","ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES","ECOSYSTEMDATA_CONF_DIRNAME_EXECUTION_DATA_DIR","ECOSYSTEMDATA_CONF_DIRNAME_UNIX_SOCKET_DIR","ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR","ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR","ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR","ECOSYSTEMDATA_CONF_DIRNAME_CONFIGURATIONS_DIR","ECOSYSTEMDATA_CONF_DIRNAME_STORAGE_DIR","ECOSYSTEMDATA_CONF_DIRNAME_NPM_DEPENDENCIES","ECOSYSTEMDATA_CONF_FILENAME_PKG_GRAPH_DATA","ECOSYSTEMDATA_CONF_FILENAME_EXECUTION_PLAN_DATA","EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES","RT_ENV_GENERATED_DIR_NAME"])

// raiz do monorepo = 6 níveis acima deste script
const ROOT = path.resolve(__dirname, "../../../../../..")
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
if (offenders) { console.error(`\nFALHA: ${offenders} arquivo(s), ${total} literal(is) das 21 vars do ecossistema. Remova-os (herança via pkg-exec).`); process.exit(1) }
console.log(`OK: ${files.length} startup-params.json verificados, 0 hardcodes das 21 vars do ecossistema.`)
