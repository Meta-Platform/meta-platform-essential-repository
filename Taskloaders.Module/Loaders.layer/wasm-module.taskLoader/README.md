# wasm-module.taskLoader

- **Tipo:** *task loader* (`.taskLoader`)
- **Namespace:** `@/wasm-module.taskLoader`
- **Localização:** `Taskloaders.Module/Loaders.layer/wasm-module.taskLoader` (EssentialRepo)

## Propósito

*Object loader* do tipo **`wasm-module`**: carrega um pacote `.wasmlib` — um
módulo **WebAssembly** — e entrega ao consumidor um handle com o binário já
compilado e instanciado.

O tipo existe para tirar trabalho numérico pesado dos laços em JavaScript sem
voltar ao addon nativo. Um `.wasm` é **um arquivo**, igual em toda plataforma:
não tem `node-gyp`, não exige toolchain na máquina que instala e não recompila a
cada versão do Node — que é exatamente a dor que o laboratório de `.nativelib`
expõe. O binário é versionado junto do pacote; quem compila é o autor do módulo,
na toolchain dele.

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `WasmModule.taskLoader.ts` | Ciclo de vida da task: lê o manifesto, compila e publica o handle. |
| `ReadWasmLibManifest.ts` | Lê e valida `metadata/wasmlib.json`; resolve o caminho do binário. |
| `CompileWasmModule.ts` | Lê os bytes e produz o `WebAssembly.Module`. |
| `CreateCoreInstance.ts` | Instancia a ABI `core` (WebAssembly puro, sem sistema operacional). |
| `CreateWasiInstance.ts` | Instancia a ABI `wasi` (preview1, via `node:wasi`). |
| `CreateWasmLibraryHandle.ts` | Monta o handle congelado entregue ao consumidor. |

## O manifesto do pacote (`metadata/wasmlib.json`)

| Campo | Obrigatório | Descrição |
|---|---|---|
| `alias` | sim | Nome pelo qual o módulo é referenciado. |
| `abi` | sim | `core` ou `wasi`. |
| `binary` | sim | Caminho do `.wasm`, **relativo** à raiz do pacote. |
| `memory` | não | `{ initialPages, maximumPages }`. Só quando o módulo **importa** `env.memory`. |
| `wasi` | só em `abi: "wasi"` | `{ mode, args, env, preopens }`. `mode` é `reactor` (padrão) ou `command`. |
| `web` | não | `{ expose: true }` — o binário também é servido ao bundle de um `.webgui`. |

### `core` ou `wasi`

**`core`** é WebAssembly puro: o módulo só enxerga o que for passado no *import
object*. Sem arquivos, sem relógio, sem rede. É o caminho recomendado, e o mesmo
binário roda no host e no navegador sem camada de compatibilidade. É o que o
Rust produz em `wasm32-unknown-unknown`.

**`wasi`** aceita código compilado com biblioteca padrão — C, C++ ou Rust em
`wasm32-wasip1` — que espera argumentos, variáveis de ambiente e descritores de
arquivo. A sandbox é **fechada por padrão**: sem `preopens` declarados, o módulo
não enxerga diretório nenhum.

`mode: "reactor"` mantém o módulo vivo (`_initialize` roda e os exports seguem
chamáveis) — é o formato de uma biblioteca. `mode: "command"` é um programa que
roda uma vez e termina; o loader **não** o executa ao ativar a task, porque subir
uma task não pode disparar um programa. Quem chama decide, por `Run()`.

### A seção `memory`

Declare `memory` **apenas** quando o módulo importa `env.memory`. Módulos
compilados para `wasm32-unknown-unknown` — o caminho normal do Rust — exportam a
própria memória linear; passar uma memória criada de fora para eles não é um
aviso, é erro de instanciação com a mensagem mais confusa possível
(*incompatible import type*).

## O handle entregue ao consumidor

| Método | Devolve |
|---|---|
| `getAlias()` | O alias declarado no manifesto. |
| `getManifest()` | Cópia do manifesto já validado. |
| `getRootPath()` | Raiz do pacote. |
| `getBinaryPath()` | Caminho absoluto do `.wasm` — é o que atravessa fronteira de processo. |
| `getModule()` | O `WebAssembly.Module` compilado, para instanciar noutro lugar sem recompilar. |
| `getExports()` | Exports da instância padrão. |
| `getMemory()` | `WebAssembly.Memory` da instância padrão (pode não existir). |
| `Instantiate(imports?)` | Instância nova e isolada, com a sua própria memória. |
| `Run(imports?)` | Só em `wasi`/`command`: instancia, executa `_start` e larga. |

### Por que `Instantiate()` existe

Compilar e instanciar são passos separados, e é essa separação que dá o ganho de
memória. `WebAssembly.compile` é o passo caro; o `WebAssembly.Module` resultante
é imutável, sem estado, e pode ser instanciado quantas vezes se quiser — cada
instância paga só a sua memória linear.

Um consumidor que processe lotes pesados cria uma instância por lote e a descarta
ao terminar. A alternativa — uma única memória linear para o processo inteiro —
cresce até o pico do maior lote e **nunca mais encolhe**: `WebAssembly.Memory`
cresce e não devolve páginas ao processo.

## Consumo

Um pacote declara o módulo como dependência no seu `metadata/boot.json`, do mesmo
modo que declara uma `.uilib`:

```json
{
    "bound-params": {
        "geometry": "@/wasm-reference.wasmlib"
    }
}
```

E o recebe já compilado e instanciado:

```javascript
const { add, alloc, dealloc, sum_f32 } = geometry.getExports()
```

### No navegador

Quando o manifesto declara `web.expose`, o **mesmo** binário é servido ao bundle
de um `.webgui` — não há uma build para o servidor e outra para o cliente. O
`.webgui` mapeia o alias no seu `metadata/endpoint-group.json`:

```json
{
    "bound-params": {
        "wasmModules": {
            "@geometry": "geometry"
        }
    }
}
```

e importa a **URL** do artefato, instanciando por conta própria:

```typescript
import wasmUrl from "@geometry"

const { instance } = await WebAssembly.instantiateStreaming(fetch(wasmUrl), {})
```

O alias aponta para um arquivo, não para uma pasta de fontes — em TypeScript, é
preciso declarar o módulo (`declare module "@geometry"`), como para qualquer
outro asset.

## Registro (`metadata/taskloaders.json` do repositório)

| Campo | Valor |
|---|---|
| `objectLoaderType` | `wasm-module` |
| `entry` | `src/WasmModule.taskLoader` |
| `npmDependencies` | — |

## Testes

```bash
npm test
```

Cobrem os dois ABIs contra binários reais: o pacote de referência
(`@/wasm-reference.wasmlib`, ABI `core`) e uma fixture WASI `reactor` compilada
em `tests/fixtures/`. As fixtures de manifesto quebrado verificam que cada falha
chega ao status da task **com motivo** — manifesto ausente, ABI desconhecida,
binário faltando e binário declarado por caminho absoluto falham todos no mesmo
ponto, e sem o motivo a task apareceria como `FAILURE` sem dizer qual dos quatro.

> Módulo de referência: [`@/wasm-reference.wasmlib`](../../../Commons.Module/Libraries.layer/wasm-reference.wasmlib/README.md).
> Para criar o seu próprio loader, veja o
> [Guia: como criar e usar um Object Loader](../../../Runtime.Module/Executor.layer/task-executor.lib/docs/guia-criar-object-loader.md).
> [README do repositório](../../../README.md)
