#!/usr/bin/env node
// CFGEC-13 — Gate de herança do ecosystem-defaults.
// Prova, usando o CÓDIGO INSTALADO (o mesmo que o pkg-exec carrega), que um
// pacote sem as vars no startup-params resolve os {{VAR}} do boot.json a partir
// do ecosystem-defaults injetado — e que, SEM injeção, permanecem literais
// (teste negativo).
//
// A afirmação é sobre TODAS as variáveis declaradas, não sobre uma amostra nem
// sobre quantas são. Um gate que fixasse o total ("são 20 vars") pediria
// edição a cada variável nova, e edição rotineira de asserção é como asserção
// morre: alguém troca o número sem ler o que ele significava. Aqui o fixture do
// boot.json é GERADO a partir do próprio ecosystem-defaults, então acrescentar
// uma variável não mexe neste arquivo — e a variável que não for herdada, ou
// que chegar com outro valor, aparece pelo nome.
//
// Uso: EXTERNAL_NODE_MODULES_PATH=<ecosystemData>/npm-dependencies/node_modules \
//      node cfgec-inheritance-gate.js [ecosystemDataDir]
//   ecosystemDataDir default: ~/EcosystemData
//
// O `/node_modules` no fim NÃO é opcional: o SmartRequire concatena o nome do
// pacote a este caminho. Apontar para `npm-dependencies` faz ele procurar
// `npm-dependencies/handlebars`, que não existe, e o gate morre antes de rodar.
const os = require("os")
const path = require("path")

const ECOSYSTEM_DATA = process.argv[2] || path.join(os.homedir(), "EcosystemData")
const ESSENTIAL = path.join(ECOSYSTEM_DATA, "repos/EssentialRepo")
const DEFAULTS_REL = "./config-files/ecosystem-defaults.json"

// Este script carrega o código INSTALADO diretamente, sem passar pelo Package
// Executor — então é ele que precisa instalar a resolução de TypeScript, ou os
// `require` abaixo não encontram nada. E os caminhos vão SEM extensão: o
// dialeto de cada arquivo é assunto da resolução, não deste gate.
require(path.join(ESSENTIAL, "Commons.Module/Libraries.layer/module-resolution.lib/src/register.js"))

const Get = require(path.join(ESSENTIAL, "Commons.Module/Libraries.layer/ecosystem-defaults-handler.lib/src/Get"))
const BuildMetadataHierarchy = require(path.join(ESSENTIAL, "Runtime.Module/MetadataHelpers.layer/dependency-graph-builder.lib/src/BuildMetadataHierarchy/BuildMetadataHierarchy"))
const { ReplaceStartupParams } = BuildMetadataHierarchy
const GetPopulatedParameters = require(path.join(ESSENTIAL, "Runtime.Module/MetadataHelpers.layer/execution-params-generator.lib/src/Utils/GetPopulatedParameters"))

let failures = 0
const ok = (c, m) => { console.log((c ? "  [OK]  " : "  [FAIL]") + " " + m); if (!c) failures++ }

const ecosystemDefaults = Get(ECOSYSTEM_DATA, DEFAULTS_REL)
const declaradas = Object.keys(ecosystemDefaults)
ok(declaradas.length > 0, `Get() -> ecossistema instalado, ${declaradas.length} vars declaradas`)

// Variavel orfa: declarada, mas sem valor que sirva de default para alguem.
const orfas = declaradas.filter((nome) => {
    const valor = ecosystemDefaults[nome]
    return valor === null || valor === undefined || valor === ""
})
ok(orfas.length === 0, `nenhuma var declarada sem valor (orfas: ${orfas.join(", ") || "nenhuma"})`)

// O boot.json de teste pede TODAS as vars declaradas, uma por chave, mais um
// {{port}} que so o proprio pacote pode responder.
const boot = declaradas.reduce((acc, nome) => ({ ...acc, [nome]: `{{${nome}}}` }), { port: "{{port}}" })
const own = { port: 9999 }
const mkH = () => ({ dependencyList: [{ dependency: { metadata: { package: { namespace: "@/cfgec-fixture.cli" }, "startup-params": { ...own } } } }], linkedGraph: {} })

const root = ReplaceStartupParams(mkH(), { ...ecosystemDefaults }).dependencyList[0].dependency.metadata["startup-params"]
ok(root.port === 9999, "merge por-no preserva o port do pacote")

const naoHerdadas = declaradas.filter((nome) => root[nome] !== ecosystemDefaults[nome])
ok(naoHerdadas.length === 0, `toda var declarada chega ao no (faltando/alterada: ${naoHerdadas.join(", ") || "nenhuma"})`)

const resolved = GetPopulatedParameters(boot, root)
ok(!JSON.stringify(resolved).includes("{{"), "COM injecao: 0 {{ residual em " + declaradas.length + " vars")

// Herdar nao basta: o {{VAR}} do boot.json tem de virar o valor declarado. A
// comparacao e por String porque a substituicao e textual — um 2048 do JSON
// chega como "2048" no parametro.
const valorErrado = declaradas.filter((nome) => resolved[nome] !== String(ecosystemDefaults[nome]))
ok(valorErrado.length === 0, `todo {{VAR}} resolve no valor declarado (divergentes: ${valorErrado.join(", ") || "nenhuma"})`)
ok(resolved.port === "9999", "{{port}} resolve pelo param do proprio pacote")

const neg = GetPopulatedParameters(boot, { ...own })
const naoLiterais = declaradas.filter((nome) => neg[nome] !== `{{${nome}}}`)
ok(naoLiterais.length === 0, `NEGATIVO (sem injecao): todo {{VAR}} permanece literal (resolvidas a esmo: ${naoLiterais.join(", ") || "nenhuma"})`)

console.log("\n== " + (failures === 0 ? "GATE OK" : failures + " FALHA(S)") + " ==")
process.exit(failures === 0 ? 0 : 1)
