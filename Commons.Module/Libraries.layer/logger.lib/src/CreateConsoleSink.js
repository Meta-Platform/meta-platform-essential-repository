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

const { GetPalette } = require("./Colors")

const LEVEL_LABEL_WIDTH  = 7
const SOURCE_LABEL_WIDTH = 23

const PaintByLevel = {
	trace   : (palette) => palette.gray,
	debug   : (palette) => palette.bgGray,
	info    : (palette) => palette.bgBlue,
	message : (palette) => palette.bgGreen.black,
	warn    : (palette) => palette.bgYellow.black,
	error   : (palette) => palette.bgRed.white,
	fatal   : (palette) => palette.bgRed.white.bold
}

const PaintLevel = (palette, level) => {
	const Paint = PaintByLevel[level] || ((currentPalette) => currentPalette.bgGray)
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
const FormatRecord = (record) => {

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
const FormatData = (record) => {

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

const CreateConsoleSink = ({ stream } = {}) => {

	const ResolveStream = () =>
		stream || process.stdout

	const Write = (record) => {

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
