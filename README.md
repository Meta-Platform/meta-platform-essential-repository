# Meta Platform — Essential Repository

> O **runtime e as bibliotecas essenciais** da Meta Platform: sem este
> repositório, nada no ecossistema executa.

## Papel dentro da Meta Platform

A Meta Platform é um ecossistema modular (ver
[portal](https://github.com/Meta-Platform) e
[mapa de repositórios](https://github.com/Meta-Platform/.github/blob/main/docs/repository-map.md)).
O **Essential Repository** fornece as peças que **todos os demais** consomem: o
**Task Executor**, os **task loaders** (object loaders), os **metadata helpers** e
as **bibliotecas comuns**. O
[package-executor](https://github.com/Meta-Platform/meta-platform-package-executor-command-line),
o [setup-wizard](https://github.com/Meta-Platform/meta-platform-setup-wizard-command-line)
e o [ecosystem-core](https://github.com/Meta-Platform/meta-platform-ecosystem-core-repository)
carregam libs daqui em runtime.

## Por que é essencial

Porque ele implementa **como um package vira uma instância**: resolver
dependências, montar a metadata hierarchy, gerar o execution params, executar as
tasks via object loaders e supervisionar. É o repositório de menor escopo de
instalação (perfis `*-minimal` instalam só ele).

## Quando usar

É instalado em **qualquer** ecossistema (namespace `EssentialRepo`). Você o usa
indiretamente sempre que roda `repo`, `supervisor`, ou executa qualquer package.

## Instalação

```bash
mywizard install --profile release-minimal   # instala apenas o EssentialRepo
```

Publica os executáveis (ver [`metadata/applications.json`](./metadata/applications.json)):
`repo` (`repository-manager.cli`), `supervisor` (`instance-supervisor.cli`),
`mytoolkit` (`maintenance-toolkit.cli`).

## Uso rápido

```bash
repo list installed                 # repositórios instalados
supervisor sockets                  # sockets de supervisão
supervisor status instance-manager.sock
```

## Conceitos importantes

- **Commons.Module** — bibliotecas utilitárias e de plataforma compartilhadas
  (I/O de JSON, download, cópia, logs, hash, navegação de repositórios, ambiente,
  cliente de supervisão).
- **Runtime.Module** — o tempo de execução: Task Executor, task loaders e metadata
  helpers.
- **Main.Module** — as CLIs essenciais (`repo`, `supervisor`, `mytoolkit`).

### Task Executor

[`task-executor.lib`](./Runtime.Module/Executor.layer/task-executor.lib/README.md)
(`Runtime.Module/Executor.layer`) — lê o `execution-params.json` e executa cada
unidade respeitando dependências e regras de ativação, gerenciando o ciclo de
vida das tasks. Ver
[Environment Runtime Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/environment-runtime-standard.md).

### Task loaders (object loaders)

`Runtime.Module/EssentialTaskLoaders.layer` — cada um instancia um
`objectLoaderType` (ver
[Tipos de Object Loader](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/concepts/tipos-de-object-loader.md)):

| Task loader | `objectLoaderType` |
|-------------|--------------------|
| [install-nodejs-package-dependencies.lib](./Runtime.Module/EssentialTaskLoaders.layer/install-nodejs-package-dependencies.lib/README.md) | `install-nodejs-package-dependencies` |
| [nodejs-package.lib](./Runtime.Module/EssentialTaskLoaders.layer/nodejs-package.lib/README.md) | `nodejs-package` |
| [application-instance.lib](./Runtime.Module/EssentialTaskLoaders.layer/application-instance.lib/README.md) | `application-instance` |
| [service-instance.lib](./Runtime.Module/EssentialTaskLoaders.layer/service-instance.lib/README.md) | `service-instance` |
| [endpoint-instance.lib](./Runtime.Module/EssentialTaskLoaders.layer/endpoint-instance.lib/README.md) | `endpoint-instance` |
| [command-application.lib](./Runtime.Module/EssentialTaskLoaders.layer/command-application.lib/README.md) | `command-application` |
| [desktop-window-instance.lib](./Runtime.Module/EssentialTaskLoaders.layer/desktop-window-instance.lib/README.md) | `desktop-window-instance` |

Para **criar um novo task loader (object loader)**, siga o
[Guia: como criar e usar um Object Loader](./Runtime.Module/Executor.layer/task-executor.lib/docs/guia-criar-object-loader.md).

### Metadata helpers

`Runtime.Module/MetadataHelpers.layer` — montam e traduzem os metadados:
[dependency-graph-builder.lib](./Runtime.Module/MetadataHelpers.layer/dependency-graph-builder.lib/README.md)
(constrói a metadata hierarchy),
[execution-params-generator.lib](./Runtime.Module/MetadataHelpers.layer/execution-params-generator.lib/README.md)
(traduz para execution params),
[metadata-hierarchy-handler.lib](./Runtime.Module/MetadataHelpers.layer/metadata-hierarchy-handler.lib/README.md),
[resolve-package-name.lib](./Runtime.Module/MetadataHelpers.layer/resolve-package-name.lib/README.md)
e
[resource-params-handler.lib](./Runtime.Module/MetadataHelpers.layer/resource-params-handler.lib/README.md)
(resolve os recursos declarados em `socket-params.json`/`storage-params.json` e
os injeta nos startup params).

### Libs usadas pelo Package Executor

Confirmado em
[`dependency-references.json`](https://github.com/Meta-Platform/meta-platform-package-executor-command-line/blob/main/src/Configs/dependency-references.json):
`task-executor.lib`, os 7 task loaders, os 5 metadata helpers,
`json-file-utilities.lib`, `repository-utilities.lib`, `environment-handler.lib` e
`utilities.lib`.

### Libs usadas pelo Script Loader (bootstrap)

O [cli-script-loader](https://github.com/Meta-Platform/meta-platform-cli-script-loader-library)
carrega, na inicialização das CLIs, libs do `EssentialRepo` — ex.:
`print-data-log.lib` e `ecosystem-install-utilities.lib` (lista em
`meta-platform-dependencies.json` do setup-wizard).

### Estrutura de bootstrap

O caminho mínimo para o ecossistema "ganhar vida": o script loader prepara o
ambiente e carrega libs essenciais → o `repository-manager.cli` (`repo`) instala
repositórios → os metadata helpers + task executor + task loaders executam os
packages. Por isso os perfis `*-minimal` instalam **apenas** este repositório.

## Estrutura do repositório

- [**Commons** Module](./Commons.Module/README.md) — Libraries / PlatformLibraries / Utilities.
- [**Runtime** Module](./Runtime.Module/README.md) — Executor / EssentialTaskLoaders / MetadataHelpers.
- [**Main** Module](./Main.Module/README.md) — Application (CLIs `repo`, `supervisor`, `mytoolkit`).

## Troubleshooting

- **`repo`/`supervisor` não encontrados** → `EcosystemData/executables` no `PATH`.
- **Erros ao executar um package** → veja o
  [troubleshooting do package-executor](https://github.com/Meta-Platform/meta-platform-package-executor-command-line/blob/main/README.md#troubleshooting).

## Links relacionados

- [Open Standard](https://github.com/Meta-Platform/meta-platform-open-standard) ·
  [Fluxo de Execução](https://github.com/Meta-Platform/.github/blob/main/docs/execution-flow.md) ·
  [Glossário](https://github.com/Meta-Platform/.github/blob/main/docs/glossario.md)

## Licença

BSD-3-Clause. Veja `LICENSE`.
