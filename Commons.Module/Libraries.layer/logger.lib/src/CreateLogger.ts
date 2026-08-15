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
const Serialize = require("./Serialize") as (value: unknown) => any
const ResolveCall = require("./ResolveCall") as ((boundSource: string | null, a?: unknown, b?: unknown, c?: unknown) => ResolvedCall) & {
	NormalizeMessage: (message: unknown) => string
	ResolveCall: (boundSource: string | null, a?: unknown, b?: unknown, c?: unknown) => ResolvedCall
}
const AttachSinkControls = require("./AttachSinkControls") as (logger: any, sinks: TargetedSink[]) => void

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

	AttachSinkControls(logger, sinks)

	return logger
}

module.exports = CreateLogger
/* Reexportados: eram superfície deste módulo antes de mudarem de arquivo. */
module.exports.NormalizeMessage = ResolveCall.NormalizeMessage
module.exports.ResolveCall = ResolveCall
