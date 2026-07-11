#!/usr/bin/env node
// CFGEC-13 — Gate de herança do ecosystem-defaults.
// Prova, usando o CÓDIGO INSTALADO (o mesmo que o pkg-exec carrega), que um
// pacote sem as 19 vars no startup-params resolve os {{VAR}} do boot.json a
// partir do ecosystem-defaults injetado — e que, SEM injeção, permanecem
// literais (teste negativo).
//
// Uso: EXTERNAL_NODE_MODULES_PATH=<ecosystemData>/npm-dependencies \
//      node cfgec-inheritance-gate.js [ecosystemDataDir]
//   ecosystemDataDir default: ~/EcosystemData
const os = require("os")
const path = require("path")

const ECOSYSTEM_DATA = process.argv[2] || path.join(os.homedir(), "EcosystemData")
const ESSENTIAL = path.join(ECOSYSTEM_DATA, "repos/EssentialRepo")
const DEFAULTS_REL = "./config-files/ecosystem-defaults.json"

const Get = require(path.join(ESSENTIAL, "Commons.Module/Libraries.layer/ecosystem-defaults-handler.lib/src/Get.js"))
const BuildMetadataHierarchy = require(path.join(ESSENTIAL, "Runtime.Module/MetadataHelpers.layer/dependency-graph-builder.lib/src/BuildMetadataHierarchy/BuildMetadataHierarchy.js"))
const { ReplaceStartupParams } = BuildMetadataHierarchy
const GetPopulatedParameters = require(path.join(ESSENTIAL, "Runtime.Module/MetadataHelpers.layer/execution-params-generator.lib/src/Utils/GetPopulatedParameters.js"))

let failures = 0
const ok = (c, m) => { console.log((c ? "  [OK]  " : "  [FAIL]") + " " + m); if (!c) failures++ }

const ecosystemDefaults = Get(ECOSYSTEM_DATA, DEFAULTS_REL)
ok(Object.keys(ecosystemDefaults).length === 19, `Get() -> 19 vars (obtido ${Object.keys(ecosystemDefaults).length})`)

const boot = { grupo: "{{REPOS_CONF_EXT_GROUP_DIR}}", metaDir: "{{PKG_CONF_DIRNAME_METADATA}}", port: "{{port}}" }
const own = { port: 9999 }
const mkH = () => ({ dependencyList: [{ dependency: { metadata: { package: { namespace: "@/cfgec-fixture.cli" }, "startup-params": { ...own } } } }], linkedGraph: {} })

const root = ReplaceStartupParams(mkH(), { ...ecosystemDefaults }).dependencyList[0].dependency.metadata["startup-params"]
ok(root.port === 9999, "merge por-no preserva o port do pacote")
ok(root.REPOS_CONF_EXT_GROUP_DIR === "group", "no herda REPOS_CONF_EXT_GROUP_DIR do ecossistema")

const resolved = GetPopulatedParameters(boot, root)
ok(!JSON.stringify(resolved).includes("{{"), "COM injecao: 0 {{ residual  -> " + JSON.stringify(resolved))
ok(resolved.grupo === "group" && resolved.metaDir === "metadata", "vars do ecossistema resolvidas")

const neg = GetPopulatedParameters(boot, { ...own })
ok(JSON.stringify(neg).includes("{{"), "NEGATIVO (sem injecao): {{VAR}} permanece literal")

console.log("\n== " + (failures === 0 ? "GATE OK" : failures + " FALHA(S)") + " ==")
process.exit(failures === 0 ? 0 : 1)
