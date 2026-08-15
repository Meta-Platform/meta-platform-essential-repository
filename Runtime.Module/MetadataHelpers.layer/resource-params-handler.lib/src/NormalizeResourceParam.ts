import type { NormalizedResourceParam, ResourceParamValue, StorageType } from "./Types"

// Normaliza UMA entrada de `socket-params.json` / `storage-params.json`.
//
// O metadado aceita duas formas, e a curta é a que cobre 90% dos casos:
//
//   "socket": "ecosystem-instance-manager.app.sock"      → o pacote é DONO do recurso
//   "iamSocketPath": { "namespace": "iam.app", "owner": false }   → só REFERENCIA
//
// A diferença entre dono e referência não é cosmética: o dono é quem faz o
// ecossistema materializar a pasta antes da execução. Quem apenas referencia
// recebe o mesmo caminho resolvido e nada é criado por ele — assim dois pacotes
// não disputam a criação do mesmo recurso, e um cliente não faz nascer o
// diretório de um servidor que talvez nem esteja instalado.
//
// Campos da forma objeto:
//   namespace — agrupa o recurso (pasta do storage; nome lógico do socket).
//               Ausente, deriva do nome do pacote que declara.
//   filename  — nome do arquivo/pasta dentro do namespace. Ausente no storage,
//               o recurso É a pasta do namespace.
//   owner     — default true. `false` = apenas referencia.
//   scope     — só socket: "ecosystem" (default) ou "supervisor", que resolve na
//               pasta de sockets do supervisor em vez da do ecossistema.
//   type      — só storage: "file" | "directory". Ausente, ver InferStorageType.

const DEFAULT_SCOPE = "ecosystem"

// Um nome com extensão é arquivo; sem extensão é pasta. É heurística, e existe
// para a forma curta continuar curta: `"instance-store.sqlite"` é claramente um
// arquivo e `"instance-logs"` claramente uma pasta. Quem tiver um caso que a
// heurística erra declara `type` explicitamente e a heurística nem roda.
const InferStorageType = (filename?: string): StorageType =>
    filename && /\.[A-Za-z0-9]+$/.test(filename) ? "file" : "directory"

const NormalizeResourceParam = (parameter: string, value: string | ResourceParamValue): NormalizedResourceParam => {

    if(typeof value === "string" || value instanceof String)
        return {
            parameter,
            namespace : undefined,
            filename  : String(value),
            owner     : true,
            scope     : DEFAULT_SCOPE,
            type      : undefined
        }

    if(!value || typeof value !== "object")
        throw new Error(`resource-params-handler: valor inválido para o parâmetro '${parameter}' — use uma string ou um objeto { namespace, filename, owner }.`)

    return {
        parameter,
        namespace : value.namespace,
        filename  : value.filename,
        // Declarar um recurso é, por padrão, possuí-lo: a referência é o caso
        // raro e por isso é ela que exige ser escrita.
        owner     : value.owner !== false,
        scope     : value.scope || DEFAULT_SCOPE,
        type      : value.type
    }
}

module.exports = NormalizeResourceParam
module.exports.InferStorageType = InferStorageType
module.exports.DEFAULT_SCOPE = DEFAULT_SCOPE
