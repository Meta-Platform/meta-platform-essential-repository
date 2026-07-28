// Downloads de rede (release do GitHub / Google Drive) falham de forma
// intermitente: github.com/codeload.github.com engasgam e devolvem
// UND_ERR_CONNECT_TIMEOUT. Sem retry, um único soluço condena a instalação.
// Aqui cada operação é tentada N vezes com backoff exponencial (com teto).
const Sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const DEFAULT_ATTEMPTS = 6
const DEFAULT_BASE_DELAY_MS = 1500
const DEFAULT_MAX_DELAY_MS = 15000

const _DescribeError = (error) =>
    (error && error.cause && error.cause.code) ||
    (error && error.code) ||
    (error && error.message) ||
    "erro desconhecido"

const RunWithRetry = async (operation, {
    attempts = DEFAULT_ATTEMPTS,
    baseDelayMs = DEFAULT_BASE_DELAY_MS,
    maxDelayMs = DEFAULT_MAX_DELAY_MS,
    label = "operação de rede"
} = {}) => {
    let lastError
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await operation(attempt)
        } catch (error) {
            lastError = error
            if (attempt < attempts) {
                const delayMs = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs)
                Log.error("RunWithRetry", `[RunWithRetry] ${label}: tentativa ${attempt}/${attempts} falhou (${_DescribeError(error)}). Nova tentativa em ${delayMs}ms...`)
                await Sleep(delayMs)
            } else {
                Log.error("RunWithRetry", `[RunWithRetry] ${label}: todas as ${attempts} tentativas falharam (${_DescribeError(error)}).`)
            }
        }
    }
    throw lastError
}

module.exports = { RunWithRetry }
