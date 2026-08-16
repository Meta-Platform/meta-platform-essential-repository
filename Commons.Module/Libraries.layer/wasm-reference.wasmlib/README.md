# wasm-reference.wasmlib

- **Tipo:** módulo WebAssembly (`.wasmlib`)
- **Namespace:** `@/wasm-reference.wasmlib`
- **Localização:** `Commons.Module/Libraries.layer/wasm-reference.wasmlib` (EssentialRepo)

## Propósito

Módulo **WebAssembly de referência** da plataforma. A superfície é
deliberadamente mínima, mas cobre os três pontos que qualquer `.wasmlib` de
verdade vai precisar:

1. **chamar e receber um escalar** — `add`, presente só para provar que o módulo
   carregou e responde;
2. **o protocolo de memória** — `alloc`/`dealloc`, o único caminho honesto para
   passar um array a um módulo que não recebe objetos, só números;
3. **o laço numérico sobre esse bloco** — `sum_f32` e `scale_f32`, que é a forma
   do trabalho que se quer tirar do JavaScript.

Serve de esqueleto para o primeiro módulo real e é o que os testes do
[`@/wasm-module.taskLoader`](../../../Taskloaders.Module/Loaders.layer/wasm-module.taskLoader/README.md)
usam para verificar a ABI `core` contra um binário de verdade.

## Manifesto (`metadata/wasmlib.json`)

| Campo | Valor |
|---|---|
| `alias` | `@wasm-reference` |
| `abi` | `core` |
| `binary` | `dist/wasm-reference.wasm` |
| `web.expose` | `true` |

Não há seção `memory`: compilado para `wasm32-unknown-unknown`, o módulo
**exporta** a própria memória linear.

## Exports do módulo

| Export | Assinatura | Responsabilidade |
|---|---|---|
| `add` | `(i32, i32) -> i32` | Soma dois inteiros. |
| `alloc` | `(usize) -> ptr` | Reserva bytes na memória linear e devolve o deslocamento. |
| `dealloc` | `(ptr, usize)` | Devolve ao alocador um bloco obtido em `alloc`. |
| `sum_f32` | `(ptr, usize) -> f64` | Soma `len` floats a partir de `ptr`. |
| `scale_f32` | `(ptr, usize, f32)` | Multiplica `len` floats por um fator, **no lugar**. |
| `memory` | — | A memória linear do módulo. |

`sum_f32` acumula em `f64` de propósito: somar milhões de `f32` num acumulador
`f32` perde precisão progressivamente, porque cada parcela nova fica pequena
demais frente ao total já acumulado.

`scale_f32` escreve de volta no **mesmo** bloco. É o padrão que interessa — o
resultado já está onde o JavaScript vai lê-lo, sem cópia de saída. É a forma de
uma transformação de geometria: aplicar uma matriz, normalizar, pintar vértices.

## Uso

```javascript
const { alloc, dealloc, sum_f32, scale_f32 } = wasmReference.getExports()
const memory = wasmReference.getMemory()

const valores = new Float32Array([1.5, 2.5, 3.0, 4.0])
const bytes = valores.byteLength
const ponteiro = alloc(bytes)

new Float32Array(memory.buffer, ponteiro, valores.length).set(valores)
const total = sum_f32(ponteiro, valores.length)

dealloc(ponteiro, bytes)
```

> **A view não se guarda.** `memory.buffer` é trocado sempre que a memória linear
> cresce, e uma view criada antes disso passa a apontar para um `ArrayBuffer`
> descolado (*detached*). Crie a view depois do `alloc`, use, descarte.

## Build

O `.wasm` é um artefato **versionado**: quem instala o pacote não precisa de
Rust. A fonte fica em `src-rust/` e é recompilada só quando o módulo muda:

```bash
cd src-rust
cargo build --release --target wasm32-unknown-unknown
cp target/wasm32-unknown-unknown/release/wasm_reference.wasm ../dist/wasm-reference.wasm
```

O perfil de release do `Cargo.toml` otimiza para **tamanho** (`opt-level = "z"`,
`lto`, `codegen-units = 1`, `panic = "abort"`, `strip`): o binário é distribuído
e recompilado a cada carga, então menos bytes valem mais que menos tempo de
build — que se paga uma vez.

> Veja o [README do repositório](../../../README.md).
