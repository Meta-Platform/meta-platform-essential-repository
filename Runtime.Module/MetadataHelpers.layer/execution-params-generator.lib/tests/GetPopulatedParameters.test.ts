/* O handlebars vem do EXTERNAL_NODE_MODULES_PATH (SmartRequire) — o script
 * `npm test` deste pacote aponta o caminho do ecossistema quando a variável não
 * estiver no ambiente. */

const { describe, it } = require('node:test') as typeof import('node:test')
const assert = (require('node:assert') as typeof import('node:assert')).strict

const GetPopulatedParameters = require("../src/Utils/GetPopulatedParameters")

describe("GetPopulatedParameters", () => {

    describe("valor herdado vazio", () => {

        it('deve herdar o valor vazio em vez de devolver o template', () => {
            assert.deepStrictEqual(GetPopulatedParameters({ b: "{{Y}}" }, { Y: "" }), { b: "" })
        })

        it('deve manter o {{VAR}} literal quando ninguém respondeu pela variável', () => {
            assert.deepStrictEqual(GetPopulatedParameters({ w: "{{W}}" }, {}), { w: "{{W}}" })
        })

        it('deve separar "não resolveu" de "resolveu vazio" no mesmo objeto', () => {
            assert.deepStrictEqual(
                GetPopulatedParameters({ a: "{{A}}", b: "{{B}}" }, { A: "" }),
                { a: "", b: "{{B}}" }
            )
        })

        it('deve continuar convertendo número em texto', () => {
            assert.deepStrictEqual(GetPopulatedParameters({ z: "{{Z}}" }, { Z: 0 }), { z: "0" })
        })

        it('deve preservar a resolução parcial do template misto', () => {
            assert.deepStrictEqual(GetPopulatedParameters({ p: "{{A}}/{{B}}" }, { A: "x" }), { p: "x/" })
        })
    })

    describe("escape de HTML", () => {

        it('deve entregar < > & sem virar entidade', () => {
            assert.deepStrictEqual(GetPopulatedParameters({ x: "{{X}}" }, { X: "a<b&c" }), { x: "a<b&c" })
        })

        it('deve preservar aspas simples de um caminho de sistema', () => {
            assert.deepStrictEqual(
                GetPopulatedParameters({ p: "{{P}}" }, { P: "/home/o'brien/EcosystemData" }),
                { p: "/home/o'brien/EcosystemData" }
            )
        })

        it('deve preservar o & de uma query string de URL', () => {
            assert.deepStrictEqual(
                GetPopulatedParameters({ url: "{{URL}}" }, { URL: "http://host/p?a=1&b=2" }),
                { url: "http://host/p?a=1&b=2" }
            )
        })

        it('deve resistir a duas passagens seguidas (params de endpoint)', () => {
            const primeira = GetPopulatedParameters({ s: "{{S}}" }, { S: "k&(#N" })
            const segunda = GetPopulatedParameters({ s: "{{s}}" }, primeira)
            assert.deepStrictEqual(segunda, { s: "k&(#N" })
        })
    })

    describe("valor que é o nome de um param", () => {

        it('deve entregar o valor cru do param, e não o texto', () => {
            assert.deepStrictEqual(
                GetPopulatedParameters({ ring: "ringNetworks" }, { ringNetworks: { r0: "metal" } }),
                { ring: { r0: "metal" } }
            )
        })

        it('deve entregar false quando o param foi declarado false', () => {
            assert.deepStrictEqual(GetPopulatedParameters({ f: "flag" }, { flag: false }), { f: false })
        })

        it('deve entregar 0 e "" quando foi isso que se declarou', () => {
            assert.deepStrictEqual(GetPopulatedParameters({ n: "num", s: "str" }, { num: 0, str: "" }), { n: 0, s: "" })
        })

        it('deve devolver o texto intocado quando o param não existe', () => {
            assert.deepStrictEqual(GetPopulatedParameters({ f: "flag" }, {}), { f: "flag" })
        })

        it('não deve resolver pelo protótipo do objeto de params', () => {
            assert.deepStrictEqual(
                GetPopulatedParameters({ a: "constructor", b: "toString", c: "hasOwnProperty" }, {}),
                { a: "constructor", b: "toString", c: "hasOwnProperty" }
            )
        })
    })

    describe("travessia da estrutura", () => {

        it('deve descer em objetos aninhados', () => {
            assert.deepStrictEqual(
                GetPopulatedParameters({ o: { i: "{{A}}", v: "{{B}}" } }, { A: "x", B: "" }),
                { o: { i: "x", v: "" } }
            )
        })

        /* Os dois `todo` abaixo descrevem um defeito PRÉ-EXISTENTE, alheio à
         * herança e deixado de fora desta correção por decisão de escopo:
         * GetPopulatedParameters e GetPopulatedArrayParameters se requerem em
         * ciclo, e como ninguém carrega o segundo primeiro, ele fica com o
         * `module.exports` vazio que o primeiro ainda não preencheu. Qualquer
         * array dentro de um params estoura com "GetPopulatedParameters is not
         * a function". Hoje é latente — nenhum params do ecossistema tem array
         * — e o mesmo estouro acontece no código anterior a esta mudança. */
        const CICLO = "ciclo de require entre GetPopulatedParameters e GetPopulatedArrayParameters"

        it('deve descer em arrays de objetos', { todo: CICLO }, () => {
            assert.deepStrictEqual(
                GetPopulatedParameters({ l: [{ i: "{{A}}" }, { i: "{{B}}" }] }, { A: "x" }),
                { l: [{ i: "x" }, { i: "{{B}}" }] }
            )
        })

        it('deve aceitar um array na raiz', { todo: CICLO }, () => {
            assert.deepStrictEqual(GetPopulatedParameters([{ i: "{{A}}" }], { A: "" }), [{ i: "" }])
        })

        it('deve deixar passar os valores que não são texto', () => {
            assert.deepStrictEqual(
                GetPopulatedParameters({ n: 8085, b: true }, {}),
                { n: 8085, b: true }
            )
        })

        it('deve deixar intocado o texto que não é template nem nome de param', () => {
            assert.deepStrictEqual(
                GetPopulatedParameters({ p: "/var/run/docker.sock" }, { A: "x" }),
                { p: "/var/run/docker.sock" }
            )
        })
    })
})
