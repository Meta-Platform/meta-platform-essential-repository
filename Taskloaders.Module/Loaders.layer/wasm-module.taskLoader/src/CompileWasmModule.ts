const fsPromises = require("fs").promises as typeof import("fs").promises

// Compilar e instanciar são passos SEPARADOS de propósito, e essa separação é o
// que dá o ganho de memória do tipo `.wasmlib`.
//
// `WebAssembly.compile` é o passo caro: lê o binário, valida e gera código de
// máquina. O resultado — um `WebAssembly.Module` — é imutável, não tem estado e
// pode ser instanciado quantas vezes se quiser. Cada instância paga só a sua
// memória linear.
//
// É por isso que o handle expõe `Instantiate()`: um consumidor que processe
// lotes pesados cria uma instância por lote e a descarta ao terminar, em vez de
// deixar uma única memória linear crescer até o pico do maior lote e nunca mais
// encolher — WebAssembly.Memory cresce e não devolve páginas.
const CompileWasmModule = async (binaryPath: string) => {
    const binary = await fsPromises.readFile(binaryPath)
    return await WebAssembly.compile(binary)
}

module.exports = CompileWasmModule
