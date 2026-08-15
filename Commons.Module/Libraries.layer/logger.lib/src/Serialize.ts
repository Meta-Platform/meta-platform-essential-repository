/*
 * Serialização defensiva do campo `data`.
 *
 * O que chega aqui é o que o chamador quis registrar — e isso inclui os dois
 * casos que quebram um `JSON.stringify` ingênuo:
 *
 *   - referência circular, que lança `TypeError`;
 *   - `Error`, cujas propriedades (`message`, `stack`) não são enumeráveis e
 *     por isso viram `{}`, apagando justamente o que importa.
 *
 * Nada aqui pode lançar: uma falha ao serializar um log não pode derrubar o
 * processo que logou.
 */

const MAX_DEPTH  = 8
const MAX_STRING = 8192
const MAX_ARRAY  = 200

const SerializeError = (error: any, depth: number, seen: WeakSet<object>): Record<string, any> => {

	const serialized: Record<string, any> = {
		name    : error.name,
		message : error.message,
		stack   : error.stack
	}

	if (error.code !== undefined) {
		serialized.code = error.code
	}

	Object.keys(error).forEach((key) => {
		if (serialized[key] === undefined) {
			serialized[key] = SerializeValue(error[key], depth + 1, seen)
		}
	})

	if (error.cause !== undefined) {
		serialized.cause = SerializeValue(error.cause, depth + 1, seen)
	}

	return serialized
}

const SerializeValue = (value: any, depth: number, seen: WeakSet<object>): any => {

	if (value === null || value === undefined) {
		return null
	}

	const type = typeof value

	if (type === "string") {
		return value.length > MAX_STRING
			? `${value.slice(0, MAX_STRING)}…[+${value.length - MAX_STRING}]`
			: value
	}

	if (type === "number") {
		return Number.isFinite(value) ? value : String(value)
	}

	if (type === "boolean") {
		return value
	}

	if (type === "bigint") {
		return `${value.toString()}n`
	}

	if (type === "function") {
		return `[Function: ${value.name || "anonymous"}]`
	}

	if (type === "symbol") {
		return value.toString()
	}

	if (depth > MAX_DEPTH) {
		return "[MaxDepth]"
	}

	if (value instanceof Date) {
		return isNaN(value.getTime()) ? "[Invalid Date]" : value.toISOString()
	}

	if (value instanceof Error) {
		if (seen.has(value)) {
			return "[Circular]"
		}
		seen.add(value)
		return SerializeError(value, depth, seen)
	}

	if (seen.has(value)) {
		return "[Circular]"
	}

	seen.add(value)

	if (Array.isArray(value)) {

		const items = value
			.slice(0, MAX_ARRAY)
			.map((item) => SerializeValue(item, depth + 1, seen))

		if (value.length > MAX_ARRAY) {
			items.push(`[+${value.length - MAX_ARRAY} itens]`)
		}

		return items
	}

	if (value instanceof Map) {
		return SerializeValue(Object.fromEntries(value), depth + 1, seen)
	}

	if (value instanceof Set) {
		return SerializeValue(Array.from(value), depth + 1, seen)
	}

	if (Buffer.isBuffer(value)) {
		return `[Buffer: ${value.length} bytes]`
	}

	return Object.keys(value)
		.reduce((serialized: Record<string, any>, key) => {
			serialized[key] = SerializeValue(value[key], depth + 1, seen)
			return serialized
		}, {})
}

const Serialize = (value: unknown): any => {
	try {
		return SerializeValue(value, 0, new WeakSet())
	} catch (error) {
		return "[Unserializable]"
	}
}

/*
 * A linha que vai para o arquivo. Devolve `null` quando nem o registro
 * degradado puder ser serializado — o sink simplesmente não escreve.
 */
const SerializeRecordLine = (record: any): string | null => {

	try {
		return `${JSON.stringify(record)}\n`
	} catch (error) {

		try {
			return `${JSON.stringify({ ...record, data : Serialize(record.data) })}\n`
		} catch (fallbackError) {
			return null
		}
	}
}

module.exports = Serialize
module.exports.Serialize = Serialize
module.exports.SerializeRecordLine = SerializeRecordLine
