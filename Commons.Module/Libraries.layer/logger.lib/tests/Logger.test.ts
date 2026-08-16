const { describe, it } = require('node:test') as typeof import('node:test')
const assert = (require('node:assert') as typeof import('node:assert')).strict

const CreateLogger = require("../src/CreateLogger")

const CreateCollectorSink = (target?: string) => {

	const records: any[] = []

	return {
		target,
		records,
		Write : (record: any) => records.push(record)
	}
}

const CreateLoggerForTest = (options: any = {}) => {

	const consoleSink = CreateCollectorSink("console")
	const fileSink    = CreateCollectorSink("file")

	const logger = CreateLogger({
		context : { origin : "repo", package : "repository-manager.cli" },
		sinks   : [consoleSink, fileSink],
		...options
	})

	return { logger, consoleSink, fileSink }
}

describe("CreateLogger", () => {

	it('deve expor os sete níveis', () => {

		const { logger } = CreateLoggerForTest()

		;["trace", "debug", "info", "message", "warn", "error", "fatal"]
			.forEach((level: string) => assert.strictEqual(typeof logger[level], "function"))
	})

	it('deve montar o registro com os campos do contrato', () => {

		const { logger, fileSink } = CreateLoggerForTest()

		logger.info("UpdateRepository", "Atualizando...")

		const record = fileSink.records[0]

		assert.strictEqual(record.level, "info")
		assert.strictEqual(record.source, "UpdateRepository")
		assert.strictEqual(record.origin, "repo")
		assert.strictEqual(record.package, "repository-manager.cli")
		assert.strictEqual(record.instanceId, null)
		assert.strictEqual(record.pid, process.pid)
		assert.strictEqual(record.message, "Atualizando...")
		assert.strictEqual(record.data, null)
		assert.match(record.ts, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/)
	})

	it('deve respeitar os dois pisos ao escolher os sinks', () => {

		const { logger, consoleSink, fileSink } = CreateLoggerForTest({
			level        : "info",
			consoleLevel : "message"
		})

		logger.trace("Fonte", "não vai a lugar nenhum")
		logger.info("Fonte", "só ao arquivo")
		logger.message("Fonte", "aos dois")

		assert.deepStrictEqual(fileSink.records.map((r) => r.message), ["só ao arquivo", "aos dois"])
		assert.deepStrictEqual(consoleSink.records.map((r) => r.message), ["aos dois"])
	})

	it('deve amarrar o source com Log.source', () => {

		const { logger, fileSink } = CreateLoggerForTest()

		const log = logger.source("UpdateRepository")

		log.info("Atualizando...")

		assert.strictEqual(fileSink.records[0].source, "UpdateRepository")
		assert.strictEqual(fileSink.records[0].message, "Atualizando...")
	})

	it('deve aceitar data junto do source amarrado', () => {

		const { logger, fileSink } = CreateLoggerForTest()

		logger.source("Fonte").error("Falhou", { code : "ENOENT" })

		assert.strictEqual(fileSink.records[0].message, "Falhou")
		assert.deepStrictEqual(fileSink.records[0].data, { code : "ENOENT" })
	})

	it('deve herdar e acrescentar contexto com Log.child', () => {

		const { logger, fileSink } = CreateLoggerForTest()

		const instanceLog = logger.child({
			instanceId      : "abc123",
			environmentPath : "/eco/environments/pkg-1a2b"
		})

		instanceLog.info("ServiceInstance", "iniciada")

		const record = fileSink.records[0]

		assert.strictEqual(record.instanceId, "abc123")
		assert.strictEqual(record.environmentPath, "/eco/environments/pkg-1a2b")
		assert.strictEqual(record.origin, "repo", "o contexto do pai é preservado")
	})

	it('deve compartilhar os sinks entre pai, child e source', () => {

		const { logger, fileSink } = CreateLoggerForTest()

		logger.child({ instanceId : "x" }).source("Fonte").info("mensagem")

		assert.strictEqual(fileSink.records.length, 1)
		assert.strictEqual(fileSink.records[0].instanceId, "x")
		assert.strictEqual(fileSink.records[0].source, "Fonte")
	})

	it('não deve deixar o contexto do child vazar para o pai', () => {

		const { logger, fileSink } = CreateLoggerForTest()

		logger.child({ instanceId : "abc123" })
		logger.info("Fonte", "do pai")

		assert.strictEqual(fileSink.records[0].instanceId, null)
	})

	it('deve serializar data de forma defensiva', () => {

		const { logger, fileSink } = CreateLoggerForTest()

		const circular: any = { nome : "raiz" }
		circular.self = circular

		logger.error("Fonte", "falhou", circular)

		assert.strictEqual(fileSink.records[0].data.self, "[Circular]")
	})

	it('deve normalizar uma mensagem que não é string', () => {

		const { logger, fileSink } = CreateLoggerForTest()

		logger.info("Fonte", new Error("veio um erro como mensagem"))

		assert.strictEqual(fileSink.records[0].message, "veio um erro como mensagem")
	})

	it('não deve lançar quando um sink falha', () => {

		const sinkQuebrado = {
			target : "file",
			Write  : () => { throw new Error("sink quebrado") }
		}

		const logger = CreateLogger({ sinks : [sinkQuebrado] })

		assert.doesNotThrow(() => logger.error("Fonte", "mensagem"))
	})

	it('deve aceitar um ouvinte em tempo de execução e removê-lo depois', () => {

		/* É como o NotificationHub acompanha o progresso de uma instalação. */
		const { logger, fileSink } = CreateLoggerForTest()

		const ouvinte = CreateCollectorSink()   // sem target: recebe tudo que passar o filtro

		const Remover = logger.AddSink(ouvinte)

		logger.info("Instalador", "baixando...")

		assert.deepStrictEqual(ouvinte.records.map((r) => r.message), ["baixando..."])
		assert.strictEqual(fileSink.records.length, 1, "os sinks originais seguem recebendo")

		Remover()

		logger.info("Instalador", "depois de remover")

		assert.strictEqual(ouvinte.records.length, 1)
		assert.strictEqual(fileSink.records.length, 2)
	})

	it('deve ignorar um ouvinte sem Write', () => {

		const { logger } = CreateLoggerForTest()

		assert.doesNotThrow(() => logger.AddSink({}))
		assert.doesNotThrow(() => logger.info("Fonte", "mensagem"))
	})

	it('deve permitir mudar os pisos em tempo de execução', () => {

		const { logger, consoleSink } = CreateLoggerForTest()

		logger.debug("Fonte", "invisível")
		assert.strictEqual(consoleSink.records.length, 0)

		logger.SetConsoleLevel("debug")
		logger.debug("Fonte", "agora aparece")

		assert.strictEqual(consoleSink.records.length, 1)
	})
})
