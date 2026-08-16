# taskloader-registry.lib

- **Tipo:** biblioteca (`.lib`)
- **Namespace:** `@/taskloader-registry.lib`
- **Localização:** `Taskloaders.Module/Registry.layer/taskloader-registry.lib` (EssentialRepo)

## Propósito

Registro **dinâmico** de object loaders. Monta o mapa
`{ objectLoaderType → função-loader }` lendo o `metadata/taskloaders.json` de cada
repositório instalado (via `repositories.json`), em vez de um mapa hard-coded.

## Exports (`src/`)

| Módulo | Responsabilidade |
|---|---|
| `CreateTaskLoaders.ts` | Varre os repositórios instalados e devolve o mapa `objectLoaderType` → função-loader. |

## API

```ts
const CreateTaskLoaders = require("taskloader-registry.lib/src/CreateTaskLoaders")
const taskLoaders = CreateTaskLoaders({ repositoriesData })
// -> { "desktop-window-instance": fn, "endpoint-instance": fn, ... }
```

`repositoriesData` é o conteúdo de `repositories.json` (namespace → `{ installationPath }`).

Consumido por: pkg-exec (`CreateTaskExecutorMachine`), `package-runner.cli`
(`RunPackage.command`) e `task-executor-machine.service`
(`StandardTaskExecutorMachine.service`).

Cada entrada de `taskloaders.json` precisa de `objectLoaderType`, `path` (caminho do
package do loader relativo à raiz do repo) e `entry` (módulo de entrada no package).
