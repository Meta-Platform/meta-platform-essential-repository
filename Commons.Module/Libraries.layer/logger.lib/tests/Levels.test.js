const { describe, it } = require('node:test')
const assert = require('node:assert').strict

const {
	LEVELS,
	IsValidLevel,
	NormalizeLevel,
	GetSeverity,
	Accepts,
	ResolveTargets
} = require("../src/Levels")

describe("Levels", () => {

	it('deve declarar os sete níveis na ordem de severidade decidida', () => {
		assert.deepStrictEqual(LEVELS, [
			"trace", "debug", "info", "message", "warn", "error", "fatal"
		])
	})

	it('deve ordenar `message` acima de `info` e abaixo de `warn`', () => {
		assert.ok(GetSeverity("message") > GetSeverity("info"))
		assert.ok(GetSeverity("message") < GetSeverity("warn"))
	})

	it('deve reconhecer os níveis válidos e recusar os inventados', () => {
		LEVELS.forEach((level) => assert.strictEqual(IsValidLevel(level), true))
		assert.strictEqual(IsValidLevel("verbose"), false)
	})

	it('deve traduzir os tipos dos mecanismos antigos', () => {
		assert.strictEqual(NormalizeLevel("warning"), "warn")
		assert.strictEqual(NormalizeLevel("success"), "message")
		assert.strictEqual(NormalizeLevel("log"), "message")
	})

	it('deve normalizar caixa e espaço', () => {
		assert.strictEqual(NormalizeLevel("  ERROR "), "error")
	})

	it('deve cair no fallback quando o nível é inválido', () => {
		assert.strictEqual(NormalizeLevel("inexistente", "debug"), "debug")
		assert.strictEqual(NormalizeLevel(undefined), "info")
		assert.strictEqual(NormalizeLevel(42, "warn"), "warn")
	})

	it('deve aceitar um evento a partir do piso, e recusar abaixo dele', () => {
		assert.strictEqual(Accepts("info", "info"), true)
		assert.strictEqual(Accepts("error", "info"), true)
		assert.strictEqual(Accepts("debug", "info"), false)
	})

	it('deve desligar o destino com o piso `off`', () => {
		assert.strictEqual(Accepts("fatal", "off"), false)
		assert.strictEqual(Accepts("fatal", "none"), false)
	})

	it('deve resolver os dois pisos de forma independente', () => {

		const targetsComPadrao = ResolveTargets("info", {
			consoleLevel : "message",
			fileLevel    : "info"
		})

		assert.deepStrictEqual(targetsComPadrao, { console : false, file : true })

		const targetsDeMensagem = ResolveTargets("message", {
			consoleLevel : "message",
			fileLevel    : "info"
		})

		assert.deepStrictEqual(targetsDeMensagem, { console : true, file : true })

		const targetsDeTrace = ResolveTargets("trace", {
			consoleLevel : "message",
			fileLevel    : "info"
		})

		assert.deepStrictEqual(targetsDeTrace, { console : false, file : false })
	})

	it('deve usar os pisos padrão quando nada é configurado', () => {
		assert.deepStrictEqual(ResolveTargets("message"), { console : true, file : true })
		assert.deepStrictEqual(ResolveTargets("debug"),   { console : false, file : false })
	})
})
