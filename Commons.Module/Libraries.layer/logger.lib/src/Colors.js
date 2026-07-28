/*
 * Acesso ao `colors` com degradação silenciosa.
 *
 * O logger é carregado no bootstrap do processo — antes, portanto, de qualquer
 * garantia de que as dependências npm do ecossistema estejam no lugar. Se o
 * `colors` não puder ser carregado, o sink de terminal continua funcionando,
 * apenas sem cor: log é observabilidade, não caminho crítico.
 */

const SmartRequire = require("../../smart-require.lib/src/SmartRequire")

const Identity = (text) => text

const BuildPlainPalette = () => new Proxy({}, {
	get : () => {
		const plain = Identity
		return new Proxy(plain, { get : () => plain })
	}
})

/*
 * O `SmartRequire` reclama no `console.error` quando não acha o módulo. Aqui
 * isso seria ruído no bootstrap de todo processo que rodar sem as dependências
 * npm resolvidas — e ruído emitido pelo próprio logger, antes de existir
 * logger. O `console.error` é calado só durante a tentativa.
 */
const LoadColors = () => {

	const originalConsoleError = console.error

	try {
		console.error = () => {}
		return SmartRequire("colors")
	} catch (error) {

		try {
			return require("colors")
		} catch (fallbackError) {
			return null
		}

	} finally {
		console.error = originalConsoleError
	}
}

const colors = LoadColors()

const IsColorSupported = () =>
	Boolean(colors) && Boolean(process.stdout && process.stdout.isTTY)

/*
 * Devolve a paleta a usar AGORA. Consultada a cada escrita — o destino do
 * stdout pode mudar (um pacote lançado pelo daemon escreve num pipe, o mesmo
 * pacote no terminal escreve num TTY).
 */
const GetPalette = () =>
	IsColorSupported() ? colors : BuildPlainPalette()

module.exports = {
	GetPalette,
	IsColorSupported
}
