# application-instance.taskLoader

- **Tipo:** *task loader* (`.taskLoader`)
- **Namespace:** `@/application-instance.taskLoader`
- **Localização:** `Taskloaders.Module/Loaders.layer/application-instance.taskLoader` (EssentialRepo)

## Propósito

*Object loader* do tipo **`application-instance`**: instancia uma aplicação
completa (com `startupParams` e serviços filhos) durante a execução de um plano
pelo *task executor*.

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `ApplicationInstance.taskLoader.js` | Carrega/instancia a `application-instance`. |

## Registro (`metadata/taskloaders.json` do repositório)

| Campo | Valor |
|---|---|
| `objectLoaderType` | `application-instance` |
| `entry` | `src/ApplicationInstance.taskLoader` |
| `npmDependencies` | — |

> Parâmetros e exemplo no `execution-params`: ver
> [Tipos de Object Loader → `application-instance`](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/concepts/tipos-de-object-loader.md#application-instance).
> Para criar o seu próprio loader, veja o
> [Guia: como criar e usar um Object Loader](../../Executor.layer/task-executor.lib/docs/guia-criar-object-loader.md).
> [README do repositório](../../../README.md)
