const os = require("os") as typeof import("os")

/**
 * Variante tolerante do `ConvertPathToAbsolutPath`: aceita `undefined` e devolve
 * string vazia, em vez de quebrar.
 *
 * A diferença com o canônico não é cosmética, e por isso os dois existem:
 * aquele passa por `path.join`, que normaliza — e transforma `""` em `"."`.
 * Quem varre repositórios instalados lê caminhos de um JSON que pode não ter a
 * chave, e para esse leitor `"."` seria uma resposta pior do que `""`.
 */
const ToAbsolutePath = (value: unknown): string =>
    String(value || "").replace("~", os.homedir())

module.exports = ToAbsolutePath
