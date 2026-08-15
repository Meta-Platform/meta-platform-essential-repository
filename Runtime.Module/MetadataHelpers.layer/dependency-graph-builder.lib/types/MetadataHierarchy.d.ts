/**
 * A hierarquia de metadados de uma execução, em tipos.
 *
 * É o que o Package Executor monta antes de subir qualquer coisa: o pacote
 * pedido, tudo de que ele depende, e como os nós se ligam. Mora na lib que a
 * constrói; quem só a percorre — o gerador de parâmetros de execução, o
 * resolvedor de recursos, o executor — importa daqui.
 */

/** Os metadados de um package, como estão no seu diretório `metadata/`. */
export type PackageMetadata = {
    package?: {
        namespace?: string
        [field: string]: any
    }
    "startup-params"?: Record<string, any>
    boot?: Record<string, any>
    [metadataFile: string]: any
}

/** Um package dentro da hierarquia: onde está e o que declara. */
export type Dependency = {
    path?: string
    metadata?: PackageMetadata
    [field: string]: any
}

/** Um nó: a dependência e o código que a identifica no grafo. */
export type DependencyNode = {
    code: string
    dependency: Dependency
    [field: string]: any
}

/**
 * As ligações entre os nós, indexadas pelo código. A primeira chave é a raiz —
 * o package que foi pedido.
 */
export type LinkedGraph = Record<string, any>

export type MetadataHierarchy = {
    dependencyList: DependencyNode[]
    linkedGraph: LinkedGraph
    /** O `ecosystem-defaults` injetado, guardado junto para quem executa. */
    ecosystemDefaults?: Record<string, any>
}
