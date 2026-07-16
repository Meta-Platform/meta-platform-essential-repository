# service-instance.lib

- **Tipo:** biblioteca / *task loader* (`.lib`) · **Namespace:** `@/service-instance.lib`

*Object loader* do tipo **`service-instance`**: instancia um serviço dentro de
uma aplicação durante a execução de um plano pelo *task executor*.

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `ServiceInstance.taskLoader.js` | Carrega/instancia o `service-instance`. |

> Parâmetros e exemplo no `execution-params`: ver
> [Tipos de Object Loader → `service-instance`](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/concepts/tipos-de-object-loader.md#service-instance).
> Para criar o seu próprio loader, veja o
> [Guia: como criar e usar um Object Loader](../../Executor.layer/task-executor.lib/docs/guia-criar-object-loader.md).
> [README do repositório](../../../README.md)
