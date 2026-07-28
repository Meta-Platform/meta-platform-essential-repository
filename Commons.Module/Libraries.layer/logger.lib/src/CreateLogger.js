/*
 * O logger.
 *
 * Monta um objeto com os sete níveis sobre um conjunto de sinks e um contexto.
 * O contexto é o que substitui o antigo `loggerEmitter` viajando como
 * parâmetro: em vez de cada função repassar de quem veio o log, o bootstrap
 * carimba uma vez (`origin`, `package`) e o taskloader acrescenta o recorte da
 * execução (`instanceId`, `environmentPath`) com `child`.
 */

const { LEVELS, NormalizeLevel, ResolveTargets, DEFAULT_LEVEL, DEFAULT_CONSOLE_LEVEL } = require("./Levels")
const { GetLocalISODateTime } = require("./Timestamp")
const Serialize = require("./Serialize")

const UNKNOWN_SOURCE = "-"

const NormalizeMessage = (message) => {

	if (typeof message === "string") {
		return message
	}

	if (message === null || message === undefined) {
		return ""
	}

	if (message instanceof Error) {
		return message.message
	}

	try {
		return typeof message === "object"
			? JSON.stringify(Serialize(message))
			: String(message)
	} catch (error) {
		return "[Unprintable]"
	}
}

/*
 * O contrato é `(source, message, data)`. Chamar com um argumento só
 * (`log.info("Atualizando...")`) é o uso natural de um logger já amarrado a um
 * source por `Log.source(...)` — nesse caso o argumento é a mensagem.
 */
const ResolveCall = (boundSource, firstArgument, secondArgument, thirdArgument) => {

	if (secondArgument === undefined && thirdArgument === undefined) {
		return {
			source  : boundSource || UNKNOWN_SOURCE,
			message : NormalizeMessage(firstArgument),
			data    : undefined
		}
	}

	if (boundSource && typeof secondArgument !== "string" && thirdArgument === undefined) {
		return {
			source  : boundSource,
			message : NormalizeMessage(firstArgument),
			data    : secondArgument
		}
	}

	return {
		source  : (firstArgument === undefined || firstArgument === null)
			? (boundSource || UNKNOWN_SOURCE)
			: String(firstArgument),
		message : NormalizeMessage(secondArgument),
		data    : thirdArgument
	}
}

const CreateLogger = ({
	context     = {},
	sinks       = [],
	level,
	consoleLevel,
	boundSource = null
} = {}) => {

	const configuration = {
		fileLevel    : NormalizeLevel(level, DEFAULT_LEVEL),
		consoleLevel : NormalizeLevel(consoleLevel, DEFAULT_CONSOLE_LEVEL)
	}

	const {
		origin         = "ecosystem",
		package : packageName = null,
		instanceId     = null,
		...extraContext
	} = context

	const BuildRecord = (levelName, { source, message, data }) => ({
		ts         : GetLocalISODateTime(),
		level      : levelName,
		source,
		origin,
		pid        : process.pid,
		package    : packageName,
		instanceId,
		...extraContext,
		message,
		data       : data === undefined ? null : Serialize(data)
	})

	const Dispatch = (levelName, record, targets) => {
		sinks.forEach((sink) => {

			try {

				if (!sink || typeof sink.Write !== "function") {
					return
				}

				if (sink.target === "console" && !targets.console) {
					return
				}

				if (sink.target === "file" && !targets.file) {
					return
				}

				sink.Write(record)

			} catch (error) {
				/* Um sink que falha não pode contaminar os outros nem o processo. */
			}
		})
	}

	const Emit = (levelName, firstArgument, secondArgument, thirdArgument) => {

		try {

			const targets = ResolveTargets(levelName, configuration)

			if (!targets.console && !targets.file) {
				return
			}

			Dispatch(
				levelName,
				BuildRecord(levelName, ResolveCall(boundSource, firstArgument, secondArgument, thirdArgument)),
				targets
			)

		} catch (error) {
			/* Log é observabilidade, não caminho crítico. */
		}
	}

	const logger = LEVELS.reduce((builtLogger, levelName) => {

		builtLogger[levelName] = (firstArgument, secondArgument, thirdArgument) =>
			Emit(levelName, firstArgument, secondArgument, thirdArgument)

		return builtLogger

	}, {})

	/*
	 * `Log.source("UpdateRepository")` — mesmo logger, mesmos sinks, com o
	 * source amarrado. `Log.child({ instanceId })` — contexto acrescentado.
	 */
	logger.source = (sourceName) => CreateLogger({
		context      : context,
		sinks,
		level        : configuration.fileLevel,
		consoleLevel : configuration.consoleLevel,
		boundSource  : sourceName
	})

	logger.child = (childContext = {}) => CreateLogger({
		context      : { ...context, ...childContext },
		sinks,
		level        : configuration.fileLevel,
		consoleLevel : configuration.consoleLevel,
		boundSource
	})

	logger.GetContext = () => ({ ...context })

	logger.GetConfiguration = () => ({ ...configuration })

	logger.SetLevel = (newLevel) => {
		configuration.fileLevel = NormalizeLevel(newLevel, configuration.fileLevel)
		return configuration.fileLevel
	}

	logger.SetConsoleLevel = (newLevel) => {
		configuration.consoleLevel = NormalizeLevel(newLevel, configuration.consoleLevel)
		return configuration.consoleLevel
	}

	logger.Flush = async () => {
		for (const sink of sinks) {
			try {
				if (sink && typeof sink.Flush === "function") {
					await sink.Flush()
				}
			} catch (error) {
				/* segue */
			}
		}
	}

	logger.FlushSync = () => {
		sinks.forEach((sink) => {
			try {
				if (sink && typeof sink.FlushSync === "function") {
					sink.FlushSync()
				}
			} catch (error) {
				/* segue */
			}
		})
	}

	logger.Close = async () => {
		for (const sink of sinks) {
			try {
				if (sink && typeof sink.Close === "function") {
					await sink.Close()
				}
			} catch (error) {
				/* segue */
			}
		}
	}

	return logger
}

module.exports = CreateLogger
module.exports.NormalizeMessage = NormalizeMessage
module.exports.ResolveCall = ResolveCall
