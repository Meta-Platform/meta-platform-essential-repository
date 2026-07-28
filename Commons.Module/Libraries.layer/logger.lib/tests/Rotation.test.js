const { describe, it, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert').strict

const fs   = require("fs")
const os   = require("os")
const path = require("path")

const {
	BuildFileName,
	ParseDateStamp,
	ResolveLogFilePath,
	ApplyRetention
} = require("../src/Rotation")

const { GetLocalDateStamp } = require("../src/Timestamp")

let dirPath = null

const CreateFile = (fileName, sizeInBytes = 0) => {
	const filePath = path.join(dirPath, fileName)
	fs.writeFileSync(filePath, sizeInBytes > 0 ? "x".repeat(sizeInBytes) : "")
	return filePath
}

describe("Rotation", () => {

	beforeEach(() => {
		dirPath = fs.mkdtempSync(path.join(os.tmpdir(), "logger-lib-rotation-"))
	})

	afterEach(() => {
		fs.rmSync(dirPath, { recursive : true, force : true })
	})

	it('deve nomear o arquivo do dia e as partes numeradas', () => {
		assert.strictEqual(BuildFileName("2026-07-27", 0), "2026-07-27.jsonl")
		assert.strictEqual(BuildFileName("2026-07-27", 2), "2026-07-27.2.jsonl")
	})

	it('deve extrair a data do nome, e ignorar o que não é log', () => {
		assert.strictEqual(ParseDateStamp("2026-07-27.jsonl"), "2026-07-27")
		assert.strictEqual(ParseDateStamp("2026-07-27.3.jsonl"), "2026-07-27")
		assert.strictEqual(ParseDateStamp("executor-manager.log"), null)
		assert.strictEqual(ParseDateStamp("qualquer-coisa.jsonl"), null)
	})

	it('deve escrever no arquivo do dia quando ele ainda cabe no teto', () => {

		const hoje = GetLocalDateStamp()

		CreateFile(`${hoje}.jsonl`, 1024)

		assert.strictEqual(
			ResolveLogFilePath({ dirPath, maxFileSizeMb : 1 }),
			path.join(dirPath, `${hoje}.jsonl`)
		)
	})

	it('deve partir para a próxima parte quando o arquivo estoura o teto', () => {

		const hoje         = GetLocalDateStamp()
		const umMegabyte   = 1024 * 1024

		CreateFile(`${hoje}.jsonl`, umMegabyte + 1)

		assert.strictEqual(
			ResolveLogFilePath({ dirPath, maxFileSizeMb : 1 }),
			path.join(dirPath, `${hoje}.1.jsonl`)
		)
	})

	it('deve pular as partes já cheias até achar a que cabe', () => {

		const hoje       = GetLocalDateStamp()
		const umMegabyte = 1024 * 1024

		CreateFile(`${hoje}.jsonl`,   umMegabyte + 1)
		CreateFile(`${hoje}.1.jsonl`, umMegabyte + 1)

		assert.strictEqual(
			ResolveLogFilePath({ dirPath, maxFileSizeMb : 1 }),
			path.join(dirPath, `${hoje}.2.jsonl`)
		)
	})

	it('deve descartar os arquivos mais velhos que a retenção e preservar os demais', () => {

		const agora = new Date("2026-07-27T10:00:00")

		CreateFile("2026-05-01.jsonl")     // muito antigo
		CreateFile("2026-07-19.jsonl")     // 8 dias — passou do prazo
		CreateFile("2026-07-20.jsonl")     // exatamente 7 dias — ainda dentro
		CreateFile("2026-07-27.jsonl")     // hoje
		CreateFile("2026-07-27.1.jsonl")   // parte de hoje
		CreateFile("nao-e-log.txt")        // não é arquivo de log

		const removidos = ApplyRetention({ dirPath, retentionDays : 7, now : agora })

		assert.deepStrictEqual(removidos.sort(), ["2026-05-01.jsonl", "2026-07-19.jsonl"])

		const restantes = fs.readdirSync(dirPath).sort()

		assert.deepStrictEqual(restantes, [
			"2026-07-20.jsonl",
			"2026-07-27.1.jsonl",
			"2026-07-27.jsonl",
			"nao-e-log.txt"
		])
	})

	it('não deve lançar quando o diretório não existe', () => {
		assert.doesNotThrow(() => {
			ApplyRetention({ dirPath : path.join(dirPath, "inexistente"), retentionDays : 7 })
		})
	})
})
