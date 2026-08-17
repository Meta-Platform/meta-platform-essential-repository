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

## O mapa é preguiçoso, e isso importa

As entradas do mapa são **getters**: o `require` do loader acontece na primeira
consulta, não na montagem. Na primeira leitura a propriedade se substitui pelo
valor, então o `require` acontece uma vez só.

O motivo é memória. O registro é montado no boot de **todo** host de TaskExecutor
— o daemon, cada `run package`, cada processo de container —, e antes disso ele
carregava todos os loaders de **todos** os repositórios instalados. Um `.service`
sem interface pagava o `endpoint-instance` do ecosystem-core e o
`install-nodejs-package-dependencies`, que arrasta o npm inteiro pelo
`@npmcli/arborist`: **35 MiB medidos, só de carregar**, retidos no require cache
por dias.

Quem consulta o mapa é o `TaskExecutor`, e só para os tipos que o pacote declara
nas suas tasks. Então a preguiça se traduz direto em loader não carregado.

O contrato **não muda**: `injectsDeps` continua sendo uma fábrica que recebe
`runtimeDeps`; o que mudou é *quando* ela roda. O `WebInterfaceBuilder` dentro de
`runtimeDeps` é getter pela mesma razão — ele arrasta a lib web inteira.

Dois efeitos colaterais que valem saber:

- Um loader **quebrado** num repositório instalado deixa de derrubar todo processo
  do ecossistema no boot. A falha passa a acontecer para quem o usa, no momento em
  que o usa.
- `Object.keys(taskLoaders)` continua listando os tipos **sem** carregá-los (ler
  chaves não dispara getter). Mas um *spread* (`{...taskLoaders}`) carregaria
  todos de uma vez — é o único uso a evitar.
