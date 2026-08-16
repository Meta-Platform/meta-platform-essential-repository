const { describe, it } = require('node:test') as typeof import('node:test')
const assert = (require('node:assert') as typeof import('node:assert')).strict

const ResolveParamsByString = require("../src/Utils/ResolveParamsByString")
const ApplyParamsByString = require("../src/Utils/ApplyParamsByString")

describe("ResolveParamsByString", () => {

    it('deve dizer que resolveu quando a variável existe', () => {
        assert.deepStrictEqual(ResolveParamsByString("{{A}}", { A: "x" }), { resolved: true, value: "x" })
    })

    it('deve dizer que resolveu mesmo quando o valor é vazio', () => {
        assert.deepStrictEqual(ResolveParamsByString("{{A}}", { A: "" }), { resolved: true, value: "" })
    })

    it('deve dizer que NÃO resolveu quando a variável não existe', () => {
        assert.deepStrictEqual(ResolveParamsByString("{{A}}", {}), { resolved: false, value: "" })
    })

    it('deve dizer que não resolveu quando falta uma das variáveis do vazio', () => {
        assert.deepStrictEqual(ResolveParamsByString("{{A}}{{B}}", { A: "" }), { resolved: false, value: "" })
    })

    it('deve considerar resolvido o que rendeu texto, mesmo com variável faltando', () => {
        assert.deepStrictEqual(ResolveParamsByString("{{A}}/{{B}}", { A: "x" }), { resolved: true, value: "x/" })
    })

    it('não deve escapar os caracteres de HTML', () => {
        assert.deepStrictEqual(
            ResolveParamsByString("{{A}}", { A: `<a href="x">&'</a>` }),
            { resolved: true, value: `<a href="x">&'</a>` }
        )
    })
})

describe("ApplyParamsByString", () => {

    it('deve devolver apenas o texto resolvido', () => {
        assert.strictEqual(ApplyParamsByString("{{A}}/fim", { A: "x" }), "x/fim")
    })

    it('deve devolver vazio quando nada resolve — o contrato de sempre', () => {
        assert.strictEqual(ApplyParamsByString("{{A}}", {}), "")
    })

    it('não deve escapar', () => {
        assert.strictEqual(ApplyParamsByString("{{A}}", { A: "a<b&c" }), "a<b&c")
    })
})
