const { describe, it } = require('node:test')
const assert = require('node:assert').strict
const { join, resolve } = require('node:path')

const ResolveModulePath = require("../src/ResolveModulePath")

const FIXTURES_PATH = resolve(__dirname, "fixtures")

describe("ResolveModulePath", () => {

    it("encontra o módulo escrito em TypeScript", () => {
        assert.equal(
            ResolveModulePath(join(FIXTURES_PATH, "Sample")),
            join(FIXTURES_PATH, "Sample.ts")
        )
    })

    it("encontra o módulo escrito em JavaScript", () => {
        assert.equal(
            ResolveModulePath(join(FIXTURES_PATH, "SampleJs")),
            join(FIXTURES_PATH, "SampleJs.js")
        )
    })

    it("dá precedência ao JavaScript quando os dois existem", () => {
        assert.equal(
            ResolveModulePath(join(FIXTURES_PATH, "Preferred")),
            join(FIXTURES_PATH, "Preferred.js")
        )
    })

    it("encontra o index de um diretório", () => {
        assert.equal(
            ResolveModulePath(join(FIXTURES_PATH, "SampleDir")),
            join(FIXTURES_PATH, "SampleDir", "index.ts")
        )
    })

    it("devolve undefined quando o módulo não existe", () => {
        assert.equal(ResolveModulePath(join(FIXTURES_PATH, "NaoExiste")), undefined)
    })

    it("aceita restringir as extensões procuradas", () => {
        assert.equal(
            ResolveModulePath(join(FIXTURES_PATH, "Preferred"), [".ts"]),
            join(FIXTURES_PATH, "Preferred.ts")
        )
    })

})
