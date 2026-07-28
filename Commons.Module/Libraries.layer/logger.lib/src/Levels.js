/*
 * Os sete níveis do log da Meta Platform, em ordem crescente de severidade.
 *
 *   trace → debug → info → message → warn → error → fatal
 *
 * `message` é a saída destinada ao HUMANO: é o piso padrão do terminal, de modo
 * que tudo que o usuário precisa ler aparece, e o que é operacional (`info`) ou
 * de diagnóstico (`debug`, `trace`) fica só no arquivo.
 */

const LEVELS = [
	"trace",
	"debug",
	"info",
	"message",
	"warn",
	"error",
	"fatal"
]

const LEVEL_SEVERITY = LEVELS
	.reduce((severityByLevel, level, index) => {
		severityByLevel[level] = index
		return severityByLevel
	}, {})

/*
 * Os tipos que os mecanismos antigos usavam. Ficam aceitos como entrada para
 * que um `dataLog` legado atravesse o logger sem virar nível inválido.
 */
const LEVEL_ALIASES = {
	"warning" : "warn",
	"success" : "message",
	"log"     : "message"
}

const DEFAULT_LEVEL         = "info"
const DEFAULT_CONSOLE_LEVEL = "message"

const IsValidLevel = (level) =>
	Object.prototype.hasOwnProperty.call(LEVEL_SEVERITY, level)

const NormalizeLevel = (level, fallbackLevel) => {

	const fallback = IsValidLevel(fallbackLevel) ? fallbackLevel : DEFAULT_LEVEL

	if (typeof level !== "string") {
		return fallback
	}

	const normalized = level.trim().toLowerCase()

	if (IsValidLevel(normalized)) {
		return normalized
	}

	if (Object.prototype.hasOwnProperty.call(LEVEL_ALIASES, normalized)) {
		return LEVEL_ALIASES[normalized]
	}

	return fallback
}

const GetSeverity = (level) =>
	LEVEL_SEVERITY[NormalizeLevel(level, DEFAULT_LEVEL)]

/*
 * O filtro. Um evento passa por um piso quando sua severidade alcança a do
 * piso. O piso especial `off` (ou `none`) desliga o destino por inteiro.
 */
const Accepts = (level, floorLevel) => {

	if (typeof floorLevel === "string") {
		const normalizedFloor = floorLevel.trim().toLowerCase()
		if (normalizedFloor === "off" || normalizedFloor === "none") {
			return false
		}
	}

	return GetSeverity(level) >= GetSeverity(floorLevel)
}

/*
 * Decide, para um único evento, quais destinos o recebem. Os dois pisos são
 * independentes: um evento pode ir para o terminal, para o arquivo, para os
 * dois ou para nenhum.
 */
const ResolveTargets = (level, { consoleLevel, fileLevel } = {}) => ({
	console : Accepts(level, NormalizeLevel(consoleLevel, DEFAULT_CONSOLE_LEVEL)),
	file    : Accepts(level, NormalizeLevel(fileLevel, DEFAULT_LEVEL))
})

module.exports = {
	LEVELS,
	LEVEL_SEVERITY,
	LEVEL_ALIASES,
	DEFAULT_LEVEL,
	DEFAULT_CONSOLE_LEVEL,
	IsValidLevel,
	NormalizeLevel,
	GetSeverity,
	Accepts,
	ResolveTargets
}
