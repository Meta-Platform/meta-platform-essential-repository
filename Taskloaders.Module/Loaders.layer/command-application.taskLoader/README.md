# command-application.taskLoader

- **Tipo:** *task loader* (`.taskLoader`)
- **Namespace:** `@/command-application.taskLoader`
- **Localização:** `Taskloaders.Module/Loaders.layer/command-application.taskLoader` (EssentialRepo)

## Propósito

*Object loader* do tipo **`command-application`**: instancia uma aplicação de
linha de comando (CLI) dentro de um plano de execução do *task executor*.

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `CommandApplication.taskLoader.js` | Carrega/instancia a `command-application`. |

## Registro (`metadata/taskloaders.json` do repositório)

| Campo | Valor |
|---|---|
| `objectLoaderType` | `command-application` |
| `entry` | `src/CommandApplication.taskLoader` |
| `npmDependencies` | `yargs` |

> Parâmetros e exemplo no `execution-params`: ver
> [Tipos de Object Loader → `command-application`](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/concepts/tipos-de-object-loader.md#command-application).
> Para criar o seu próprio loader, veja o
> [Guia: como criar e usar um Object Loader](../../Executor.layer/task-executor.lib/docs/guia-criar-object-loader.md).
> [README do repositório](../../../README.md)
