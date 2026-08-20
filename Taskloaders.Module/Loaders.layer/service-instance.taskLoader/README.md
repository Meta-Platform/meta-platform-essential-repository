# service-instance.taskLoader

- **Tipo:** *task loader* (`.taskLoader`)
- **Namespace:** `@/service-instance.taskLoader`
- **Localização:** `Taskloaders.Module/Loaders.layer/service-instance.taskLoader` (EssentialRepo)

## Propósito

*Object loader* do tipo **`service-instance`**: instancia um serviço dentro de
uma aplicação durante a execução de um plano pelo *task executor*.

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `ServiceInstance.taskLoader.ts` | Carrega/instancia o `service-instance`. |

## Registro (`metadata/taskloaders.json` do repositório)

| Campo | Valor |
|---|---|
| `objectLoaderType` | `service-instance` |
| `entry` | `src/ServiceInstance.taskLoader` |
| `npmDependencies` | — |

> Parâmetros e exemplo no `execution-params`: ver
> [Tipos de Object Loader → `service-instance`](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/concepts/tipos-de-object-loader.md#service-instance).
> Para criar o seu próprio loader, veja o
> [Guia: como criar e usar um Object Loader](../../../Runtime.Module/Executor.layer/task-executor.lib/docs/guia-criar-object-loader.md).
> [README do repositório](../../../README.md)
