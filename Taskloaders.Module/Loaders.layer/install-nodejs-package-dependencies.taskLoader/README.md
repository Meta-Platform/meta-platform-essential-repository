# install-nodejs-package-dependencies.taskLoader

- **Tipo:** *task loader* (`.taskLoader`)
- **Namespace:** `@/install-nodejs-package-dependencies.taskLoader`
- **Localização:** `Taskloaders.Module/Loaders.layer/install-nodejs-package-dependencies.taskLoader` (EssentialRepo)

## Propósito

*Object loader* do tipo **`install-nodejs-package-dependencies`**: instala as
dependências Node.js de um package no diretório de dependências do ambiente de
execução. É uma task de **execução única** (termina em `FINISHED`).

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `InstallNodejsPackageDependencies.taskLoader.ts` | Lê o `package.json`, prepara o diretório e instala as dependências. |
| `InstallNpmPackage.ts` | Executa a instalação via npm. |
| `ReadPackageJsonFile.ts` | Lê o `package.json` do package. |
| `PreparePackageDependenciesDir.ts` | Prepara o diretório de dependências no ambiente. |
| `CreatePackageDependenciesDir.ts` | Cria o diretório de dependências. |
| `VerifyPackageDependenciesDir.ts` | Verifica o diretório de dependências. |

## Registro (`metadata/taskloaders.json` do repositório)

| Campo | Valor |
|---|---|
| `objectLoaderType` | `install-nodejs-package-dependencies` |
| `entry` | `src/InstallNodejsPackageDependencies.taskLoader` |
| `npmDependencies` | `@npmcli/arborist`, `colors` |

## Quando a instalação é dispensada

A task é emitida em **toda** preparação de ambiente, mas ela só chega a instalar
alguma coisa quando há o que instalar. Antes de qualquer trabalho, o
`InstallNpmPackage` compara duas coisas:

1. **O pedido** — a lista `nome@versão` e os `overrides` — contra o que ficou
   registrado em `.meta-dependencies.json` no diretório de dependências.
2. **O disco** — cada pacote declarado precisa existir em `node_modules`.

Batendo as duas, a instalação é dispensada. A segunda condição não é zelo: o
manifesto pode estar certo e o `node_modules` ter sido podado, e acreditar só no
manifesto entregaria um serviço que morre em `Cannot find module` no primeiro
`require`, longe daqui.

Num container esse é o caminho **normal** — as dependências chegam instaladas na
imagem — e é o que mantém o `@npmcli/arborist` fora do heap: ele é o npm inteiro,
35 MiB medidos só de carregar, e ficaria no require cache pelo resto da vida do
processo. Quando a instalação é necessária, ele entra por `require` adiado.

> O `require` adiado é seguro **aqui** porque o `SmartRequire` resolve por
> `EXTERNAL_NODE_MODULES_PATH`, que o package-executor define uma vez para o
> processo inteiro e nunca desfaz. É diferente do `NODE_PATH` do
> `nodejs-package.taskLoader`, que só vale durante a carga do arquivo — ali um
> `require` adiado falha sempre.

O manifesto é escrito **depois** do `reify`: escrito antes, uma instalação
interrompida viraria "já satisfeita" no boot seguinte. `META_FORCE_NPM_REIFY=1`
desliga o atalho e força o arborist a reconciliar a árvore.

> Parâmetros e exemplo no `execution-params`: ver
> [Tipos de Object Loader → `install-nodejs-package-dependencies`](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/concepts/tipos-de-object-loader.md#install-nodejs-package-dependencies).
> Para criar o seu próprio loader, veja o
> [Guia: como criar e usar um Object Loader](../../../Runtime.Module/Executor.layer/task-executor.lib/docs/guia-criar-object-loader.md).
> [README do repositório](../../../README.md)
