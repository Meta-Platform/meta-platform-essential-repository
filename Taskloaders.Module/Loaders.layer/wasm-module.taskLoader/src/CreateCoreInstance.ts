// Instancia um módulo de ABI `core`: WebAssembly puro, sem sistema operacional
// por baixo. O módulo só enxerga o que for passado no import object — nada de
// arquivos, relógio ou rede a não ser que o consumidor entregue a função.
//
// É a forma mais restrita e a mais portátil: o mesmo binário roda aqui e no
// navegador sem nenhuma camada de compatibilidade.

const PAGE_NOT_DECLARED = undefined

// A memória vem de um dos dois lados, nunca dos dois:
//
// - o manifesto declara `memory` → o loader cria e a passa em `env.memory`;
// - o manifesto não declara → o módulo exporta a sua (o caso do Rust em
//   `wasm32-unknown-unknown`, que é o caminho normal).
//
// Passar uma memória importada para um módulo que exporta a própria não é um
// aviso: é erro de instanciação, e o mais confuso possível ("incompatible
// import type"). Por isso a decisão é do manifesto e não uma tentativa.
const CreateImportedMemory = (memoryDeclaration: any) => {
    if (!memoryDeclaration) return PAGE_NOT_DECLARED
    const { initialPages, maximumPages } = memoryDeclaration
    return new WebAssembly.Memory({
        initial: initialPages,
        ...maximumPages === undefined ? {} : { maximum: maximumPages }
    })
}

const CreateCoreInstance = ({ compiledModule, manifest, imports = {} }: {
    compiledModule: WebAssembly.Module
    manifest: any
    imports?: Record<string, any>
}) => {

    const importedMemory = CreateImportedMemory(manifest.memory)

    const importObject = importedMemory
        ? { ...imports, env: { ...imports.env, memory: importedMemory } }
        : imports

    const instance = new WebAssembly.Instance(compiledModule, importObject)

    // Quem responde pela memória é quem a criou. Sem memória importada, a
    // exportada é a do módulo — e um módulo pode legitimamente não ter nenhuma
    // (uma função aritmética pura não precisa de memória linear).
    const memory = importedMemory || (instance.exports.memory as WebAssembly.Memory | undefined)

    return { instance, exports: instance.exports, memory }
}

module.exports = CreateCoreInstance
