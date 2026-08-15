const { describe, it } = require('node:test')
const assert = require('node:assert').strict
const { join, resolve } = require('node:path')

const InstallTypeScriptResolution = require("../src/InstallTypeScriptResolution")

const FIXTURES_PATH = resolve(__dirname, "fixtures")

describe("InstallTypeScriptResolution", () => {

    it("instala uma vez e reconhece a segunda chamada", () => {
        assert.equal(InstallTypeScriptResolution(), true)
        assert.equal(InstallTypeScriptResolution(), false)
    })

    it("carrega um .ts por require sem extensão", () => {
        InstallTypeScriptResolution()
        assert.equal(require("./fixtures/Sample")({ name: "mundo" }), "ola mundo")
    })

    it("carrega o index.ts de um diretório", () => {
        InstallTypeScriptResolution()
        assert.equal(require("./fixtures/SampleDir")(), "index")
    })

    it("carrega por caminho absoluto, como fazem os loaders da plataforma", () => {
        InstallTypeScriptResolution()
        assert.equal(require(join(FIXTURES_PATH, "Sample"))({ name: "abs" }), "ola abs")
    })

    // Precedência do JavaScript: o hook só age depois que a resolução nativa
    // falha, então um .js existente nunca é substituído pelo .ts de mesmo nome.
    // É o que permite converter package por package sem quebrar o que roda.
    it("preserva a precedência do JavaScript quando os dois existem", () => {
        InstallTypeScriptResolution()
        assert.equal(require("./fixtures/Preferred")(), "javascript")
    })

    it("não interfere no erro de módulo inexistente", () => {
        InstallTypeScriptResolution()
        assert.throws(() => require("./fixtures/NaoExiste"), { code: "MODULE_NOT_FOUND" })
    })

})
