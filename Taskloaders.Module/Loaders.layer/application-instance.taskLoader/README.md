# application-instance.lib

- **Tipo:** biblioteca / *task loader* (`.lib`) · **Namespace:** `@/application-instance.lib`

*Object loader* do tipo **`application-instance`**: instancia uma aplicação
completa (com `startupParams` e serviços filhos) durante a execução de um plano
pelo *task executor*.

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `ApplicationInstance.taskLoader.js` | Carrega/instancia a `application-instance`. |

> Parâmetros e exemplo no `execution-params`: ver
> [Tipos de Object Loader → `application-instance`](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/concepts/tipos-de-object-loader.md#application-instance).
> Para criar o seu próprio loader, veja o
> [Guia: como criar e usar um Object Loader](../../Executor.layer/task-executor.lib/docs/guia-criar-object-loader.md).
> [README do repositório](../../../README.md)
