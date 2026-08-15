const { describe, it } = require('node:test')
const assert = require('node:assert').strict

const AssertTypeScriptRuntime = require("../src/AssertTypeScriptRuntime")

describe("AssertTypeScriptRuntime", () => {

    it("aceita a versão em que o type stripping passou a ser padrão", () => {
        assert.doesNotThrow(() => AssertTypeScriptRuntime("22.18.0"))
    })

    it("aceita versões posteriores", () => {
        assert.doesNotThrow(() => AssertTypeScriptRuntime("22.22.2"))
        assert.doesNotThrow(() => AssertTypeScriptRuntime("24.0.1"))
    })

    it("recusa a versão imediatamente anterior", () => {
        assert.throws(() => AssertTypeScriptRuntime("22.17.9"), /22.18 ou superior/)
    })

    it("recusa major anterior", () => {
        assert.throws(() => AssertTypeScriptRuntime("20.11.0"), /em uso: 20.11.0/)
    })

    it("aceita o runtime que está executando o teste", () => {
        assert.doesNotThrow(() => AssertTypeScriptRuntime())
    })

})
