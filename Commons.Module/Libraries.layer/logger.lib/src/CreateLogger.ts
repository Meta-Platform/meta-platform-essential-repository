/*
 * O logger.
 *
 * Monta um objeto com os sete níveis sobre um conjunto de sinks e um contexto.
 * O contexto é o que substitui o antigo `loggerEmitter` viajando como
 * parâmetro: em vez de cada função repassar de quem veio o log, o bootstrap
 * carimba uma vez (`origin`, `package`) e o taskloader acrescenta o recorte da
 * execução (`instanceId`, `environmentPath`) com `child`.
 */

import type { LogLevel, Logger } from "../types/Logger"
import type { CreateLoggerFn, CreateLoggerParams, LogRecord, LogTargets, ResolvedCall, TargetedSink } from "./Types"

const { LEVELS, NormalizeLevel, ResolveTargets, DEFAULT_LEVEL, DEFAULT_CONSOLE_LEVEL } = require("./Levels")
const { GetLocalISODateTime } = require("./Timestamp")
const Serialize = require("./Serialize")

const UNKNOWN_SOURCE = "-"

const NormalizeMessage = (message: unknown): string => {

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
const ResolveCall = (boundSource: string | null, firstArgument?: unknown, secondArgument?: unknown, thirdArgument?: unknown): ResolvedCall => {

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

const CreateLogger: CreateLoggerFn = ({
	context     = {},
	sinks       = [],
	level,
	consoleLevel,
	boundSource = null
}: CreateLoggerParams = {}) => {

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

	const BuildRecord = (levelName: LogLevel, { source, message, data }: ResolvedCall): LogRecord => ({
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

	const Dispatch = (levelName: LogLevel, record: LogRecord, targets: LogTargets) => {
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

	const Emit = (levelName: LogLevel, firstArgument?: unknown, secondArgument?: unknown, thirdArgument?: unknown) => {

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

	const logger: any = LEVELS.reduce((builtLogger: any, levelName: LogLevel) => {

		builtLogger[levelName] = (firstArgument?: unknown, secondArgument?: unknown, thirdArgument?: unknown) =>
			Emit(levelName, firstArgument, secondArgument, thirdArgument)

		return builtLogger

	}, {})

	/*
	 * `Log.source("UpdateRepository")` — mesmo logger, mesmos sinks, com o
	 * source amarrado. `Log.child({ instanceId })` — contexto acrescentado.
	 */
	logger.source = (sourceName: string) => CreateLogger({
		context      : context,
		sinks,
		level        : configuration.fileLevel,
		consoleLevel : configuration.consoleLevel,
		boundSource  : sourceName
	})

	logger.child = (childContext: Record<string, unknown> = {}) => CreateLogger({
		context      : { ...context, ...childContext },
		sinks,
		level        : configuration.fileLevel,
		consoleLevel : configuration.consoleLevel,
		boundSource
	})

	/*
	 * Sink registrado em tempo de execução. Existe para quem precisa OUVIR o log
	 * sem ser um destino permanente — o caso concreto é o NotificationHub, que
	 * mostra no painel o progresso de uma instalação (ADR-05 / LOGS-32).
	 *
	 * Atenção ao escopo: o logger é global, então um ouvinte registrado durante
	 * uma operação recebe TUDO o que o processo logar naquela janela, não apenas
	 * o da operação. Registre pelo menor tempo possível e remova no `finally`.
	 */
	logger.AddSink = (sink: TargetedSink) => {
		if (sink && typeof sink.Write === "function") sinks.push(sink)
		return () => logger.RemoveSink(sink)
	}

	logger.RemoveSink = (sink: TargetedSink) => {
		const posicao = sinks.indexOf(sink)
		if (posicao !== -1) sinks.splice(posicao, 1)
	}

	logger.GetContext = () => ({ ...context })

	logger.GetConfiguration = () => ({ ...configuration })

	logger.SetLevel = (newLevel: unknown) => {
		configuration.fileLevel = NormalizeLevel(newLevel, configuration.fileLevel)
		return configuration.fileLevel
	}

	logger.SetConsoleLevel = (newLevel: unknown) => {
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
