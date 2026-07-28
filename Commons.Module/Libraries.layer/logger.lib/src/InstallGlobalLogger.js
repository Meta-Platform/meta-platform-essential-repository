/*
 * Instala `globalThis.Log`.
 *
 * É o que substitui o `loggerEmitter` viajando como parâmetro: chamado UMA vez
 * no bootstrap do processo (pkg-exec, package-runner, wizard, electron-main),
 * o logger passa a estar disponível em qualquer arquivo, sem `require` e sem a
 * guarda `loggerEmitter && ...`.
 *
 * Idempotente: chamar duas vezes devolve o logger já instalado e não empilha
 * ponte sobre ponte.
 */

const path = require("path")

const CreateLogger          = require("./CreateLogger")
const CreateConsoleSink     = require("./CreateConsoleSink")
const CreateJsonlSink       = require("./CreateJsonlSink")
const InstallConsoleBridge  = require("./InstallConsoleBridge")

const { DEFAULT_LEVEL, DEFAULT_CONSOLE_LEVEL } = require("./Levels")

const GLOBAL_KEY  = "Log"
const GLOBAL_MARK = Symbol.for("meta-platform.logger.globalLogger")

const IsGlobalLoggerInstalled = () =>
	Boolean(globalThis[GLOBAL_MARK])

const GetGlobalLogger = () =>
	globalThis[GLOBAL_KEY]

const BuildSinks = ({
	logsDirPath,
	fileName,
	maxFileSizeMb,
	retentionDays,
	stream,
	disableConsoleSink,
	disableFileSink
}) => {

	const sinks = []

	if (!disableConsoleSink) {
		sinks.push(CreateConsoleSink({ stream }))
	}

	if (!disableFileSink && logsDirPath) {
		sinks.push(CreateJsonlSink({
			dirPath : logsDirPath,
			fileName,
			maxFileSizeMb,
			retentionDays
		}))
	}

	return sinks
}

/*
 * O processo pode terminar com linhas ainda na fila do sink de arquivo. No
 * `exit` não há mais event loop, então a drenagem final é síncrona.
 */
const RegisterExitFlush = (logger) => {

	const Flush = () => {
		try {
			logger.FlushSync()
		} catch (error) {
			/* segue */
		}
	}

	process.on("exit", Flush)

	return () => process.removeListener("exit", Flush)
}

const InstallGlobalLogger = ({
	origin        = "ecosystem",
	package : packageName = null,
	instanceId    = null,
	context       = {},
	logsDirPath   = null,
	fileName      = null,
	level         = DEFAULT_LEVEL,
	consoleLevel  = DEFAULT_CONSOLE_LEVEL,
	maxFileSizeMb,
	retentionDays,
	stream,
	bridgeConsole = true,
	disableConsoleSink = false,
	disableFileSink    = false,
	force         = false
} = {}) => {

	/*
	 * O `cli-script-loader` instala uma versão MÍNIMA deste logger (ele roda
	 * antes de existir ecossistema, então não pode carregar esta lib). Quando o
	 * processo chega aqui, o ecossistema existe — a versão completa, com sink de
	 * arquivo, rotação e retenção, substitui a mínima.
	 */
	const isMinimalInstallation = IsGlobalLoggerInstalled()
		&& Boolean(globalThis[GLOBAL_MARK].minimal)

	if (IsGlobalLoggerInstalled() && !force && !isMinimalInstallation) {
		return GetGlobalLogger()
	}

	if (IsGlobalLoggerInstalled()) {
		UninstallGlobalLogger()
	}

	const sinks = BuildSinks({
		logsDirPath : logsDirPath ? path.resolve(logsDirPath) : null,
		fileName,
		maxFileSizeMb,
		retentionDays,
		stream,
		disableConsoleSink,
		disableFileSink
	})

	const logger = CreateLogger({
		context : {
			origin,
			package : packageName,
			instanceId,
			...context
		},
		sinks,
		level,
		consoleLevel
	})

	const UninstallBridge = bridgeConsole
		? InstallConsoleBridge({ logger })
		: () => {}

	/*
	 * Um CANAL é um logger que escreve num arquivo próprio, à parte do log do
	 * processo. É o que permite ao daemon manter `logs/instances/<id>.jsonl` —
	 * um arquivo por instância — sem recriar escrita em disco por fora da lib.
	 *
	 * O canal não escreve no terminal: o que ele registra pertence à instância,
	 * não à sessão de quem está olhando o daemon.
	 */
	logger.OpenFileChannel = ({ dirPath, fileName, context : channelContext = {}, level : channelLevel } = {}) => {

		const channelSink = CreateJsonlSink({
			dirPath,
			fileName,
			maxFileSizeMb,
			retentionDays
		})

		const channel = CreateLogger({
			context : {
				origin,
				package : packageName,
				instanceId,
				...context,
				...channelContext
			},
			sinks        : [channelSink],
			level        : channelLevel || level,
			consoleLevel : "off"
		})

		channel.Close = async () => channelSink.Close()

		return channel
	}

	const UnregisterExitFlush = RegisterExitFlush(logger)

	globalThis[GLOBAL_KEY] = logger

	Object.defineProperty(globalThis, GLOBAL_MARK, {
		value        : { UninstallBridge, UnregisterExitFlush },
		configurable : true,
		enumerable   : false,
		writable     : false
	})

	return logger
}

/*
 * Existe para o teste e para o `force`: devolve `console` e `globalThis` ao
 * estado anterior.
 */
const UninstallGlobalLogger = () => {

	const installation = globalThis[GLOBAL_MARK]

	if (!installation) {
		return
	}

	try {
		installation.UninstallBridge()
	} catch (error) {
		/* segue */
	}

	try {
		installation.UnregisterExitFlush()
	} catch (error) {
		/* segue */
	}

	delete globalThis[GLOBAL_KEY]
	delete globalThis[GLOBAL_MARK]
}

module.exports = InstallGlobalLogger
module.exports.InstallGlobalLogger = InstallGlobalLogger
module.exports.UninstallGlobalLogger = UninstallGlobalLogger
module.exports.IsGlobalLoggerInstalled = IsGlobalLoggerInstalled
module.exports.GetGlobalLogger = GetGlobalLogger
module.exports.GLOBAL_KEY = GLOBAL_KEY
module.exports.GLOBAL_MARK = GLOBAL_MARK
