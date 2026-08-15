/**
 * A hierarquia de um repositório, em tipos:
 *
 *     Repository → Module → Layer → [Group] → Package
 *
 * Cada nível carrega a identidade do nível acima, porque é assim que a varredura
 * devolve: um pacote sabe de que camada veio, a camada sabe de que módulo, e o
 * módulo de que repositório. Ver o conceito Module / Layer / Group do
 * Open Standard.
 */

export type RepositoryEntry = {
    namespace: string
    installationPath: string
    [field: string]: any
}

export type ModuleEntry = {
    moduleName: string
    namespaceRepo: string
}

export type LayerEntry = ModuleEntry & {
    layerName: string
}

export type PackageEntry = LayerEntry & {
    packageName: string
    /** O tipo do pacote — `lib`, `cli`, `service`, `webgui`… */
    ext: string
    /** O grupo que o contém, quando o pacote vive dentro de um. */
    parentGroup?: string
    layerPath: string
}
