/*
 * Os sete níveis do log da Meta Platform, em ordem crescente de severidade.
 *
 *   trace → debug → info → message → warn → error → fatal
 *
 * `message` é a saída destinada ao HUMANO: é o piso padrão do terminal, de modo
 * que tudo que o usuário precisa ler aparece, e o que é operacional (`info`) ou
 * de diagnóstico (`debug`, `trace`) fica só no arquivo.
 */

import type { LogLevel } from "../types/Logger"

const LEVELS: LogLevel[] = [
	"trace",
	"debug",
	"info",
	"message",
	"warn",
	"error",
	"fatal"
]

const LEVEL_SEVERITY = LEVELS
	.reduce((severityByLevel: Record<string, number>, level, index) => {
		severityByLevel[level] = index
		return severityByLevel
	}, {})

/*
 * Os tipos que os mecanismos antigos usavam. Ficam aceitos como entrada para
 * que um `dataLog` legado atravesse o logger sem virar nível inválido.
 */
const LEVEL_ALIASES: Record<string, LogLevel> = {
	"warning" : "warn",
	"success" : "message",
	"log"     : "message"
}

const DEFAULT_LEVEL: LogLevel         = "info"
const DEFAULT_CONSOLE_LEVEL: LogLevel = "message"

const IsValidLevel = (level: string): boolean =>
	Object.prototype.hasOwnProperty.call(LEVEL_SEVERITY, level)

const NormalizeLevel = (level: unknown, fallbackLevel?: unknown): LogLevel => {

	const fallback = (typeof fallbackLevel === "string" && IsValidLevel(fallbackLevel))
		? fallbackLevel as LogLevel
		: DEFAULT_LEVEL

	if (typeof level !== "string") {
		return fallback
	}

	const normalized = level.trim().toLowerCase()

	if (IsValidLevel(normalized)) {
		return normalized as LogLevel
	}

	if (Object.prototype.hasOwnProperty.call(LEVEL_ALIASES, normalized)) {
		return LEVEL_ALIASES[normalized]
	}

	return fallback
}

const GetSeverity = (level: unknown): number =>
	LEVEL_SEVERITY[NormalizeLevel(level, DEFAULT_LEVEL)]

/*
 * O filtro. Um evento passa por um piso quando sua severidade alcança a do
 * piso. O piso especial `off` (ou `none`) desliga o destino por inteiro.
 */
const Accepts = (level: unknown, floorLevel: unknown): boolean => {

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
const ResolveTargets = (level: unknown, { consoleLevel, fileLevel }: { consoleLevel?: unknown, fileLevel?: unknown } = {}) => ({
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
