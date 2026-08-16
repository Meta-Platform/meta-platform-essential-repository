const { describe, it, beforeEach, afterEach } = require('node:test') as typeof import('node:test')
const assert = (require('node:assert') as typeof import('node:assert')).strict

const fs   = require("fs")   as typeof import("fs")
const os   = require("os")   as typeof import("os")
const path = require("path") as typeof import("path")

const CreateConsoleSink = require("../src/CreateConsoleSink")
const CreateJsonlSink   = require("../src/CreateJsonlSink")

const { GetLocalDateStamp } = require("../src/Timestamp")

const CreateFakeStream = () => {

	const written: string[] = []

	return {
		written,
		isTTY : false,
		write : (text: string) => {
			written.push(text)
			return true
		}
	}
}

const BuildRecord = (overrides: any = {}) => ({
	ts         : "2026-07-27T10:12:03.412",
	level      : "info",
	source     : "UpdateRepository",
	origin     : "repo",
	pid        : 48213,
	package    : "repository-manager.cli",
	instanceId : null,
	message    : "Atualizando...",
	data       : null,
	...overrides
})

describe("CreateConsoleSink", () => {

	it('deve escrever no formato canônico, sem cor quando não há TTY', () => {

		const stream = CreateFakeStream()

		CreateConsoleSink({ stream }).Write(BuildRecord())

		assert.strictEqual(stream.written.length, 1)
		assert.strictEqual(
			stream.written[0],
			"[2026-07-27T10:12:03.412] [repo] [info   ] [UpdateRepository       ] Atualizando...\n"
		)
	})

	it('deve alinhar nível e source com a largura fixa do formato', () => {

		const stream = CreateFakeStream()

		CreateConsoleSink({ stream }).Write(BuildRecord({ level : "warn", source : "A" }))

		assert.ok(stream.written[0].includes("[warn   ] [A                      ]"))
	})

	it('deve escrever `message` LIMPO, sem carimbo — é a fala com o usuário', () => {

		/*
		 * Uma tabela renderizada ou a listagem de um `repo sources` não pode sair
		 * com data/origem/nível na frente: o carimbo destruiria o que o usuário
		 * foi ver. No arquivo o registro segue completo.
		 */
		const stream = CreateFakeStream()

		CreateConsoleSink({ stream }).Write(BuildRecord({
			level   : "message",
			source  : "<stdout>",
			message : "EssentialRepo"
		}))

		assert.strictEqual(stream.written[0], "EssentialRepo\n")
	})

	it('deve preservar uma tabela multi-linha intacta', () => {

		const stream = CreateFakeStream()
		const tabela = "┌─────┐\n│ ID  │\n└─────┘"

		CreateConsoleSink({ stream }).Write(BuildRecord({ level : "message", message : tabela }))

		assert.strictEqual(stream.written[0], `${tabela}\n`)
	})

	it('deve declarar-se como sink de console', () => {
		assert.strictEqual(CreateConsoleSink({ stream : CreateFakeStream() }).target, "console")
	})

	it('deve levar o detalhe ao terminal em error e fatal, e não nos demais níveis', () => {

		const stream = CreateFakeStream()
		const sink   = CreateConsoleSink({ stream })

		sink.Write(BuildRecord({ level : "error", data : { code : "ENOENT" } }))
		assert.strictEqual(stream.written.length, 2)
		assert.ok(stream.written[1].includes('{"code":"ENOENT"}'))

		stream.written.length = 0

		sink.Write(BuildRecord({ level : "info", data : { code : "ENOENT" } }))
		assert.strictEqual(stream.written.length, 1)
	})

	it('não deve lançar quando o stream falha', () => {

		const streamQuebrado = {
			write : () => { throw new Error("EPIPE") }
		}

		assert.doesNotThrow(() => CreateConsoleSink({ stream : streamQuebrado }).Write(BuildRecord()))
	})
})

describe("CreateJsonlSink", () => {

	let dirPath: any = null

	beforeEach(() => {
		dirPath = fs.mkdtempSync(path.join(os.tmpdir(), "logger-lib-jsonl-"))
	})

	afterEach(() => {
		fs.rmSync(dirPath, { recursive : true, force : true })
	})

	it('não deve escrever de forma síncrona — Write só enfileira', () => {

		const sink = CreateJsonlSink({ dirPath })

		sink.Write(BuildRecord())

		assert.deepStrictEqual(fs.readdirSync(dirPath), [])
	})

	it('deve gravar uma linha JSON por evento no arquivo do dia', async () => {

		const sink = CreateJsonlSink({ dirPath })

		sink.Write(BuildRecord())
		sink.Write(BuildRecord({ level : "error", message : "Falhou" }))

		await sink.Flush()

		const filePath = path.join(dirPath, `${GetLocalDateStamp()}.jsonl`)
		const linhas   = fs.readFileSync(filePath, "utf8").trim().split("\n")

		assert.strictEqual(linhas.length, 2)

		const primeiro = JSON.parse(linhas[0])

		assert.strictEqual(primeiro.level, "info")
		assert.strictEqual(primeiro.source, "UpdateRepository")
		assert.strictEqual(primeiro.message, "Atualizando...")
		assert.strictEqual(JSON.parse(linhas[1]).level, "error")
	})

	it('deve criar o diretório de logs quando ele ainda não existe', async () => {

		const dirAninhado = path.join(dirPath, "ecosystem", "profundo")
		const sink        = CreateJsonlSink({ dirPath : dirAninhado })

		sink.Write(BuildRecord())
		await sink.Flush()

		assert.strictEqual(fs.existsSync(dirAninhado), true)
	})

	it('deve escrever num arquivo fixo quando o recorte não é a data', async () => {

		const sink = CreateJsonlSink({ dirPath, fileName : "abc123.jsonl" })

		sink.Write(BuildRecord({ instanceId : "abc123" }))
		await sink.Flush()

		assert.deepStrictEqual(fs.readdirSync(dirPath), ["abc123.jsonl"])
	})

	it('deve engolir falha de I/O sem derrubar o processo', async () => {

		const arquivoNoLugarDoDiretorio = path.join(dirPath, "bloqueio")
		fs.writeFileSync(arquivoNoLugarDoDiretorio, "sou um arquivo")

		const sink = CreateJsonlSink({ dirPath : path.join(arquivoNoLugarDoDiretorio, "logs") })

		assert.doesNotThrow(() => sink.Write(BuildRecord()))

		await sink.Flush()

		assert.ok(sink.GetDiscardedLineCount() > 0)
	})

	it('deve sobreviver a um registro com referência circular', async () => {

		const circular: any = { nome : "raiz" }
		circular.self = circular

		const sink = CreateJsonlSink({ dirPath })

		assert.doesNotThrow(() => sink.Write(BuildRecord({ data : circular })))

		await sink.Flush()
	})

	it('deve drenar de forma síncrona no FlushSync', () => {

		const sink = CreateJsonlSink({ dirPath })

		sink.Write(BuildRecord({ message : "última linha antes do exit" }))
		sink.FlushSync()

		const conteudo = fs.readFileSync(path.join(dirPath, `${GetLocalDateStamp()}.jsonl`), "utf8")

		assert.ok(conteudo.includes("última linha antes do exit"))
	})

	it('deve declarar-se como sink de arquivo', () => {
		assert.strictEqual(CreateJsonlSink({ dirPath }).target, "file")
	})
})
