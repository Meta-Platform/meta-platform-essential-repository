/**
 * Contratos do resource-params-handler.lib — os recursos que um package declara
 * (`socket-params.json`, `storage-params.json`) e os caminhos em que eles se
 * tornam reais.
 */

/** Onde o socket é resolvido: na pasta do ecossistema ou na do supervisor. */
export type ResourceScope = "ecosystem" | "supervisor"

export type StorageType = "file" | "directory"

/** A forma longa de uma declaração — a curta é só o nome do arquivo. */
export type ResourceParamValue = {
    namespace?: string
    filename?: string
    /** Ausente é `true`: declarar um recurso é, por padrão, possuí-lo. */
    owner?: boolean
    scope?: ResourceScope
    type?: StorageType
}

/** Uma declaração já normalizada, antes de virar caminho. */
export type NormalizedResourceParam = {
    parameter: string
    namespace?: string
    filename?: string
    owner: boolean
    scope: ResourceScope | string
    type?: StorageType
}

/**
 * O recurso resolvido: onde ele fica, e se este package é quem o materializa.
 * `dirPath` é a pasta que o ecossistema cria — para um arquivo, a que o contém.
 */
export type ResolvedResource = NormalizedResourceParam & {
    kind: "socket" | "storage"
    namespace: string
    path: string
    dirPath: string
    /** Acrescentado ao montar o inventário: de qual package o recurso é. */
    packagePath?: string
}

/**
 * Um parâmetro cujo valor já existente diverge do caminho que o recurso impõe.
 * Guarda os DOIS lados: o que custa caro no diagnóstico é descobrir que existe
 * um segundo valor para o mesmo nome.
 */
export type ResourceCollision = {
    packagePath?: string
    packageNamespace?: string
    parameter: string
    kind: "socket" | "storage"
    owner: boolean
    currentValue: any
    resourceValue: string
}
