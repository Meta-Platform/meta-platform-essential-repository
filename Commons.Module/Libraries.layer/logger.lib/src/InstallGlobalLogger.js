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

	if (IsGlobalLoggerInstalled() && !force) {
		return GetGlobalLogger()
	}

	if (IsGlobalLoggerInstalled() && force) {
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
