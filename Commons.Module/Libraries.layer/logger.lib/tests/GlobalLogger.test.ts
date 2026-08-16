const { describe, it, afterEach } = require('node:test') as typeof import('node:test')
const assert = (require('node:assert') as typeof import('node:assert')).strict

const InstallGlobalLogger = require("../src/InstallGlobalLogger")

const {
	UninstallGlobalLogger,
	IsGlobalLoggerInstalled
} = require("../src/InstallGlobalLogger")

const InstallConsoleBridge = require("../src/InstallConsoleBridge")
const { IsBridgeInstalled } = require("../src/InstallConsoleBridge")

const CreateFakeStream = () => {
	const written: string[] = []
	return { written, isTTY : false, write : (text: string) => written.push(text) }
}

const CreateFakeConsole = () => ({
	log   : () => {},
	info  : () => {},
	debug : () => {},
	warn  : () => {},
	error : () => {}
})

describe("InstallGlobalLogger", () => {

	afterEach(() => UninstallGlobalLogger())

	it('deve instalar globalThis.Log', () => {

		const stream = CreateFakeStream()

		InstallGlobalLogger({
			origin        : "repo",
			package       : "repository-manager.cli",
			stream,
			disableFileSink : true,
			bridgeConsole   : false
		})

		assert.strictEqual(IsGlobalLoggerInstalled(), true)
		assert.strictEqual(typeof globalThis.Log.info, "function")

		/* `message` sai limpo: é a fala do programa com o usuário. */
		globalThis.Log.message("UpdateRepository", "Atualizando...")
		assert.strictEqual(stream.written[0], "Atualizando...\n")

		/* Os demais níveis levam o carimbo, com a origem do processo. */
		globalThis.Log.warn("UpdateRepository", "diretório já existia")
		assert.ok(stream.written[1].includes("[repo]"))
		assert.ok(stream.written[1].includes("diretório já existia"))
	})

	it('deve ser idempotente: a segunda chamada devolve o logger já instalado', () => {

		const primeiro = InstallGlobalLogger({ disableFileSink : true, bridgeConsole : false, stream : CreateFakeStream() })
		const segundo  = InstallGlobalLogger({ disableFileSink : true, bridgeConsole : false, stream : CreateFakeStream() })

		assert.strictEqual(primeiro, segundo)
		assert.strictEqual(globalThis.Log, primeiro)
	})

	it('deve substituir a instalação quando force é pedido', () => {

		const primeiro = InstallGlobalLogger({ disableFileSink : true, bridgeConsole : false, stream : CreateFakeStream() })
		const segundo  = InstallGlobalLogger({ disableFileSink : true, bridgeConsole : false, stream : CreateFakeStream(), force : true })

		assert.notStrictEqual(primeiro, segundo)
		assert.strictEqual(globalThis.Log, segundo)
	})

	it('deve substituir a instalação MÍNIMA do cli-script-loader', () => {

		/*
		 * O cli-script-loader instala uma versão mínima deste logger antes de
		 * existir ecossistema. Quando esta lib entra, ela precisa assumir — do
		 * contrário o processo seguiria sem sink de arquivo, rotação e retenção.
		 */
		const loggerMinimo = { minimal : true, info : () => {} }
		let pontePreviaDesinstalada = false

		globalThis.Log = loggerMinimo

		Object.defineProperty(globalThis, Symbol.for("meta-platform.logger.globalLogger"), {
			value : {
				minimal             : true,
				UninstallBridge     : () => { pontePreviaDesinstalada = true },
				UnregisterExitFlush : () => {}
			},
			configurable : true,
			enumerable   : false,
			writable     : false
		})

		const completo = InstallGlobalLogger({
			disableFileSink : true,
			bridgeConsole   : false,
			stream          : CreateFakeStream()
		})

		assert.notStrictEqual(completo, loggerMinimo)
		assert.strictEqual(globalThis.Log, completo)
		assert.strictEqual(completo.minimal, undefined)
		assert.strictEqual(pontePreviaDesinstalada, true, "a ponte da versão mínima precisa sair junto")
	})

	it('deve abrir um canal que escreve num arquivo próprio, fora do terminal', async () => {

		/* É como o daemon mantém logs/instances/<instanceId>.jsonl. */
		const fs   = require("fs")   as typeof import("fs")
		const os   = require("os")   as typeof import("os")
		const path = require("path") as typeof import("path")

		const dirPath = fs.mkdtempSync(path.join(os.tmpdir(), "canal-"))
		const stream  = CreateFakeStream()

		InstallGlobalLogger({ origin : "executor", stream, disableFileSink : true, bridgeConsole : false })

		const canal = globalThis.Log.OpenFileChannel({
			dirPath,
			fileName : "abc123.jsonl",
			context  : { instanceId : "abc123" }
		})

		canal.info("Daemon", "instância lançada")
		await canal.Close()

		const registros = fs.readFileSync(path.join(dirPath, "abc123.jsonl"), "utf8")
			.trim().split("\n").map(JSON.parse)

		assert.strictEqual(registros.length, 1)
		assert.strictEqual(registros[0].instanceId, "abc123")
		assert.strictEqual(registros[0].message, "instância lançada")
		assert.strictEqual(stream.written.length, 0, "o canal não escreve no terminal")

		fs.rmSync(dirPath, { recursive : true, force : true })
	})

	it('deve remover globalThis.Log ao desinstalar', () => {

		InstallGlobalLogger({ disableFileSink : true, bridgeConsole : false, stream : CreateFakeStream() })
		UninstallGlobalLogger()

		assert.strictEqual(IsGlobalLoggerInstalled(), false)
		assert.strictEqual(globalThis.Log, undefined)
	})
})

describe("InstallConsoleBridge", () => {

	it('deve mapear cada método de console ao seu nível e source', () => {

		const registros: any[] = []
		const fakeConsole      = CreateFakeConsole()

		const logger = {
			message : (source: string, message: string) => registros.push({ level : "message", source, message }),
			info    : (source: string, message: string) => registros.push({ level : "info",    source, message }),
			debug   : (source: string, message: string) => registros.push({ level : "debug",   source, message }),
			warn    : (source: string, message: string) => registros.push({ level : "warn",    source, message }),
			error   : (source: string, message: string) => registros.push({ level : "error",   source, message })
		}

		const Uninstall = InstallConsoleBridge({ logger, consoleObject : fakeConsole })

		fakeConsole.log("saída para o humano")
		fakeConsole.info("operacional")
		fakeConsole.debug("diagnóstico")
		fakeConsole.warn("degradou")
		fakeConsole.error("falhou")

		assert.deepStrictEqual(registros, [
			{ level : "message", source : "<stdout>", message : "saída para o humano" },
			{ level : "info",    source : "<stdout>", message : "operacional" },
			{ level : "debug",   source : "<stdout>", message : "diagnóstico" },
			{ level : "warn",    source : "<stderr>", message : "degradou" },
			{ level : "error",   source : "<stderr>", message : "falhou" }
		])

		Uninstall()
	})

	it('deve formatar múltiplos argumentos como o console faz', () => {

		const registros: string[] = []
		const fakeConsole         = CreateFakeConsole()

		const Uninstall = InstallConsoleBridge({
			logger        : { message : (source: string, message: string) => registros.push(message) },
			consoleObject : fakeConsole
		})

		fakeConsole.log("pacote %s subiu em %dms", "my-desktop", 42)
		fakeConsole.log("objeto:", { a : 1 })

		assert.strictEqual(registros[0], "pacote my-desktop subiu em 42ms")
		assert.ok(registros[1].startsWith("objeto:"))

		Uninstall()
	})

	it('deve levar o Error para data, preservando o stack', () => {

		const registros: any[] = []
		const fakeConsole      = CreateFakeConsole()

		const Uninstall = InstallConsoleBridge({
			logger        : { error : (source: string, message: string, data: any) => registros.push({ message, data }) },
			consoleObject : fakeConsole
		})

		const erro = new Error("boom")
		fakeConsole.error(erro)

		assert.strictEqual(registros[0].data, erro)

		Uninstall()
	})

	it('não deve encadear ponte sobre ponte', () => {

		const registros: string[] = []
		const fakeConsole         = CreateFakeConsole()

		const logger = { message : (source: string, message: string) => registros.push(message) }

		const Uninstall  = InstallConsoleBridge({ logger, consoleObject : fakeConsole })
		const UninstallDeNovo = InstallConsoleBridge({ logger, consoleObject : fakeConsole })

		fakeConsole.log("uma vez só")

		assert.strictEqual(registros.length, 1)
		assert.strictEqual(Uninstall, UninstallDeNovo)

		Uninstall()
	})

	it('deve devolver o console original ao desinstalar', () => {

		const fakeConsole = CreateFakeConsole()
		const original    = fakeConsole.log

		const Uninstall = InstallConsoleBridge({
			logger        : { message : () => {} },
			consoleObject : fakeConsole
		})

		assert.notStrictEqual(fakeConsole.log, original)
		assert.strictEqual(IsBridgeInstalled(fakeConsole), true)

		Uninstall()

		assert.strictEqual(fakeConsole.log, original)
		assert.strictEqual(IsBridgeInstalled(fakeConsole), false)
	})

	it('não deve deixar o logger derrubar quem chamou console', () => {

		const fakeConsole = CreateFakeConsole()

		const Uninstall = InstallConsoleBridge({
			logger        : { message : () => { throw new Error("logger quebrado") } },
			consoleObject : fakeConsole
		})

		assert.doesNotThrow(() => fakeConsole.log("mensagem"))

		Uninstall()
	})
})
