/**
 * `WebAssembly` para o runtime da plataforma.
 *
 * Existe por uma lacuna do TypeScript, não do Node: `WebAssembly` é global no
 * Node desde sempre, mas o TypeScript só o declara dentro de `lib.dom` e
 * `lib.webworker` — e nenhuma das duas cabe numa base de runtime Node. Puxar
 * `dom` faria `document` e `window` passarem na checagem de um pacote que roda
 * fora do navegador, que é justamente a mentira que o gate existe para evitar.
 *
 * Então declaramos aqui a superfície que a plataforma usa de fato. Se um pacote
 * precisar de mais, acrescente — e só o que for usar.
 */

declare namespace WebAssembly {

    /** Módulo já compilado, pronto para instanciar quantas vezes for preciso. */
    class Module {
        constructor(bytes: BufferSource)
    }

    /** Uma instância do módulo, com os seus exports. */
    class Instance {
        constructor(module: Module, importObject?: Record<string, Record<string, unknown>>)
        readonly exports: Record<string, unknown>
    }

    /** Memória linear compartilhada entre o host e o módulo. */
    class Memory {
        constructor(descriptor: { initial: number, maximum?: number, shared?: boolean })
        readonly buffer: ArrayBuffer
        grow(delta: number): number
    }

    function compile(bytes: BufferSource): Promise<Module>

    function instantiate(
        bytes: BufferSource,
        importObject?: Record<string, Record<string, unknown>>
    ): Promise<{ module: Module, instance: Instance }>

    function instantiate(
        module: Module,
        importObject?: Record<string, Record<string, unknown>>
    ): Promise<Instance>

    function validate(bytes: BufferSource): boolean
}
