/*
 * A ponte `console.* → Log`.
 *
 * Ela é PERMANENTE, e não um degrau de migração: dependência npm e o próprio
 * Electron escrevem em `console` e não têm como chamar o `Log`. Sem a ponte,
 * essa saída ficaria fora do histórico.
 *
 * Dois riscos que este arquivo precisa fechar:
 *
 *   - RECURSÃO: o sink de terminal escreve com `process.stdout.write`. Se
 *     escrevesse com `console`, cada log realimentaria a ponte.
 *   - ENCADEAMENTO: instalar duas vezes não pode empilhar ponte sobre ponte —
 *     a marca `BRIDGE_MARK` identifica um `console` já montado.
 */

const util = require("util")

const BRIDGE_MARK = Symbol.for("meta-platform.logger.consoleBridge")

const BRIDGED_METHODS = {
	log   : { level : "message", source : "<stdout>" },
	info  : { level : "info",    source : "<stdout>" },
	debug : { level : "debug",   source : "<stdout>" },
	warn  : { level : "warn",    source : "<stderr>" },
	error : { level : "error",   source : "<stderr>" }
}

const IsBridgeInstalled = (consoleObject = console) =>
	Boolean(consoleObject && consoleObject[BRIDGE_MARK])

const FormatArguments = (args) => {
	try {
		return util.format(...args)
	} catch (error) {
		return args.map((argument) => String(argument)).join(" ")
	}
}

/*
 * Um `console.error(err)` carrega o erro no primeiro argumento — leva-lo para
 * `data` preserva o `stack`, que de outro modo viraria texto solto.
 */
const ExtractErrorData = (args) => {

	const firstError = args.find((argument) => argument instanceof Error)

	return firstError === undefined ? undefined : firstError
}

const InstallConsoleBridge = ({
	logger,
	consoleObject = console
} = {}) => {

	if (!logger || !consoleObject) {
		return () => {}
	}

	if (IsBridgeInstalled(consoleObject)) {
		return consoleObject[BRIDGE_MARK].Uninstall
	}

	const originalMethods = {}

	Object.keys(BRIDGED_METHODS).forEach((methodName) => {

		const { level, source } = BRIDGED_METHODS[methodName]

		originalMethods[methodName] = consoleObject[methodName]

		consoleObject[methodName] = (...args) => {
			try {
				logger[level](source, FormatArguments(args), ExtractErrorData(args))
			} catch (error) {
				/* Log é observabilidade, não caminho crítico. */
			}
		}
	})

	const Uninstall = () => {

		Object.keys(originalMethods).forEach((methodName) => {
			consoleObject[methodName] = originalMethods[methodName]
		})

		delete consoleObject[BRIDGE_MARK]
	}

	Object.defineProperty(consoleObject, BRIDGE_MARK, {
		value        : { Uninstall, originalMethods },
		configurable : true,
		enumerable   : false,
		writable     : false
	})

	return Uninstall
}

module.exports = InstallConsoleBridge
module.exports.BRIDGE_MARK = BRIDGE_MARK
module.exports.BRIDGED_METHODS = BRIDGED_METHODS
module.exports.IsBridgeInstalled = IsBridgeInstalled
