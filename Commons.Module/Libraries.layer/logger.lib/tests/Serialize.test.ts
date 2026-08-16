const { describe, it } = require('node:test') as typeof import('node:test')
const assert = (require('node:assert') as typeof import('node:assert')).strict

const Serialize = require("../src/Serialize")
const { SerializeRecordLine } = require("../src/Serialize")

describe("Serialize", () => {

	it('deve sobreviver a referência circular', () => {

		const objeto: any = { nome : "raiz" }
		objeto.self = objeto

		const serializado = Serialize(objeto)

		assert.strictEqual(serializado.nome, "raiz")
		assert.strictEqual(serializado.self, "[Circular]")
		assert.doesNotThrow(() => JSON.stringify(serializado))
	})

	it('deve preservar message e stack de um Error (que não são enumeráveis)', () => {

		const erro: any = new Error("falhou ao abrir")
		erro.code = "ENOENT"

		const serializado = Serialize(erro)

		assert.strictEqual(serializado.name, "Error")
		assert.strictEqual(serializado.message, "falhou ao abrir")
		assert.strictEqual(serializado.code, "ENOENT")
		assert.ok(typeof serializado.stack === "string" && serializado.stack.length > 0)
	})

	it('deve serializar Error aninhado em objeto', () => {

		const serializado = Serialize({ contexto : "update", error : new Error("boom") })

		assert.strictEqual(serializado.error.message, "boom")
	})

	it('deve converter os tipos que o JSON não representa', () => {

		const serializado = Serialize({
			grande  : 10n,
			funcao  : function MinhaFuncao () {},
			data    : new Date("2026-07-27T10:12:03.412Z"),
			ausente : undefined
		})

		assert.strictEqual(serializado.grande, "10n")
		assert.strictEqual(serializado.funcao, "[Function: MinhaFuncao]")
		assert.strictEqual(serializado.data, "2026-07-27T10:12:03.412Z")
		assert.strictEqual(serializado.ausente, null)
	})

	it('deve cortar profundidade excessiva sem estourar a pilha', () => {

		let raiz: any = {}
		let atual: any = raiz

		for (let indice = 0; indice < 50; indice++) {
			atual.filho = {}
			atual = atual.filho
		}

		assert.doesNotThrow(() => JSON.stringify(Serialize(raiz)))
	})

	it('deve produzir uma linha JSONL terminada em quebra de linha', () => {

		const linha = SerializeRecordLine({
			ts      : "2026-07-27T10:12:03.412",
			level   : "info",
			source  : "UpdateRepository",
			message : "Atualizando..."
		})

		assert.ok(linha.endsWith("\n"))
		assert.strictEqual(JSON.parse(linha).source, "UpdateRepository")
	})
})
