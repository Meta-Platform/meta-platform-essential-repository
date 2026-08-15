/*
 * Sink de terminal.
 *
 * Mantém o formato que o ecossistema já usava, agora com os sete níveis:
 *
 *   [2026-07-27T10:12:03.412] [repo] [info   ] [UpdateRepository       ] Atualizando...
 *
 * Duas regras que não podem ser quebradas:
 *
 *   1. Escrever com `process.stdout.write`, NUNCA com `console` — a ponte
 *      `console.* → Log` se realimentaria e viraria recursão infinita.
 *   2. Sem cor quando não há TTY.
 */

import type { LogLevel } from "../types/Logger"
import type { LogRecord, TargetedSink } from "./Types"

const { GetPalette } = require("./Colors")

const LEVEL_LABEL_WIDTH  = 7
const SOURCE_LABEL_WIDTH = 23

const PaintByLevel: Record<LogLevel, (palette: any) => any> = {
	trace   : (palette: any) => palette.gray,
	debug   : (palette: any) => palette.bgGray,
	info    : (palette: any) => palette.bgBlue,
	message : (palette: any) => palette.bgGreen.black,
	warn    : (palette: any) => palette.bgYellow.black,
	error   : (palette: any) => palette.bgRed.white,
	fatal   : (palette: any) => palette.bgRed.white.bold
}

const PaintLevel = (palette: any, level: LogLevel) => {
	const Paint = PaintByLevel[level] || ((currentPalette: any) => currentPalette.bgGray)
	return Paint(palette)
}

/*
 * `message` é a saída destinada ao HUMANO — a fala do programa com quem o
 * executou. No terminal ela sai LIMPA, sem carimbo: prefixar a listagem de um
 * `repo sources` ou uma tabela renderizada com data, origem e nível destruiria
 * justamente aquilo que o usuário foi ver. No arquivo o registro continua
 * completo e estruturado, como todos os outros.
 *
 * Os demais níveis são log de verdade e levam o carimbo.
 */
const FormatRecord = (record: LogRecord): string => {

	if (record.level === "message") {
		return record.message
	}

	const palette = GetPalette()

	const {
		ts,
		level,
		source,
		origin,
		message
	} = record

	const [
		timestampFormatted,
		originFormatted,
		levelFormatted,
		sourceFormatted
	] = [
		palette.dim(`[${ts}]`),
		palette.bgYellow.black(`[${origin}]`),
		PaintLevel(palette, level)(`[${String(level).padEnd(LEVEL_LABEL_WIDTH)}]`),
		palette.inverse(`[${String(source).padEnd(SOURCE_LABEL_WIDTH)}]`)
	]

	return `${timestampFormatted} ${originFormatted} ${levelFormatted} ${sourceFormatted} ${message}`
}

/*
 * `data` não entra no formato canônico — ele vive no arquivo, que é onde se
 * consulta. A exceção são `error` e `fatal`: um erro sem o seu detalhe no
 * terminal seria uma regressão em relação ao `console.error` que este logger
 * substitui.
 */
const FormatData = (record: LogRecord): string | null => {

	const { level, data } = record

	if (data === null || data === undefined) {
		return null
	}

	if (level !== "error" && level !== "fatal") {
		return null
	}

	try {
		return GetPalette().dim(`  ${JSON.stringify(data)}`)
	} catch (error) {
		return null
	}
}

const CreateConsoleSink = ({ stream }: { stream?: NodeJS.WritableStream } = {}): TargetedSink => {

	const ResolveStream = () =>
		stream || process.stdout

	const Write = (record: LogRecord) => {

		try {

			const target = ResolveStream()

			if (!target || typeof target.write !== "function") {
				return
			}

			const dataLine = FormatData(record)

			target.write(`${FormatRecord(record)}\n`)

			if (dataLine !== null) {
				target.write(`${dataLine}\n`)
			}

		} catch (error) {
			/* Log é observabilidade, não caminho crítico. */
		}
	}

	return {
		target : "console",
		Write,
		Flush : async () => {},
		Close : async () => {}
	}
}

module.exports = CreateConsoleSink
module.exports.FormatRecord = FormatRecord
