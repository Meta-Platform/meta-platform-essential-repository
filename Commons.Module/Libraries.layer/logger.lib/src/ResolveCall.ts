import type { ResolvedCall } from "./Types"

const Serialize = require("./Serialize") as (value: unknown) => any

const UNKNOWN_SOURCE = "-"

/**
 * Lê o que o chamador quis dizer.
 *
 * O contrato é `(source, message, data)`, mas nem toda chamada o escreve por
 * inteiro — e as formas curtas não são descuido: um logger já amarrado a um
 * source por `Log.source(...)` fala com uma frase só. Este módulo é o que
 * decide, para cada forma, o que é origem, o que é mensagem e o que é dado.
 */

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

const ResolveCall = (boundSource: string | null, firstArgument?: unknown, secondArgument?: unknown, thirdArgument?: unknown): ResolvedCall => {

	/* Um argumento só: é a mensagem — o uso natural de quem já tem source. */
	if (secondArgument === undefined && thirdArgument === undefined) {
		return {
			source  : boundSource || UNKNOWN_SOURCE,
			message : NormalizeMessage(firstArgument),
			data    : undefined
		}
	}

	/* Dois argumentos com source amarrado e o segundo não sendo texto: mensagem
	 * e dado estruturado. */
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

module.exports = ResolveCall
module.exports.NormalizeMessage = NormalizeMessage
module.exports.ResolveCall = ResolveCall
