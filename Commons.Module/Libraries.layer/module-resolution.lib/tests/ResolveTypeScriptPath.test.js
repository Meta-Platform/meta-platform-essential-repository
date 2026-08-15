const { describe, it } = require('node:test')
const assert = require('node:assert').strict
const { join, resolve } = require('node:path')
const { pathToFileURL } = require('node:url')

const ResolveTypeScriptPath = require("../src/ResolveTypeScriptPath")

const FIXTURES_PATH = resolve(__dirname, "fixtures")
// Um pai fictício dentro de fixtures: o que importa é o diretório de onde o
// specifier relativo será resolvido.
const PARENT_URL = pathToFileURL(join(FIXTURES_PATH, "Parent.js")).href

describe("ResolveTypeScriptPath", () => {

    it("resolve specifier relativo sem extensão para o arquivo .ts", () => {
        assert.equal(
            ResolveTypeScriptPath("./Sample", PARENT_URL),
            join(FIXTURES_PATH, "Sample.ts")
        )
    })

    it("resolve diretório para o seu index.ts", () => {
        assert.equal(
            ResolveTypeScriptPath("./SampleDir", PARENT_URL),
            join(FIXTURES_PATH, "SampleDir", "index.ts")
        )
    })

    // O executor e o nodejs-package.taskLoader requerem por caminho absoluto,
    // montado a partir dos metadados — não por caminho relativo ao chamador.
    it("resolve specifier absoluto sem depender do pai", () => {
        assert.equal(
            ResolveTypeScriptPath(join(FIXTURES_PATH, "Sample"), undefined),
            join(FIXTURES_PATH, "Sample.ts")
        )
    })

    it("ignora dependência externa (specifier bare)", () => {
        assert.equal(ResolveTypeScriptPath("yargs/yargs", PARENT_URL), undefined)
    })

    it("devolve undefined quando não há .ts correspondente", () => {
        assert.equal(ResolveTypeScriptPath("./NaoExiste", PARENT_URL), undefined)
    })

    it("devolve undefined para specifier relativo sem pai", () => {
        assert.equal(ResolveTypeScriptPath("./Sample", undefined), undefined)
    })

    // O parentURL pode não ser `file:` — não é motivo para quebrar a resolução.
    it("tolera parentURL que não é file:", () => {
        assert.equal(ResolveTypeScriptPath("./Sample", "data:text/javascript,0"), undefined)
    })

})
