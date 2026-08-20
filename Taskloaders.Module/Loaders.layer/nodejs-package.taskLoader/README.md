# nodejs-package.taskLoader

- **Tipo:** *task loader* (`.taskLoader`)
- **Namespace:** `@/nodejs-package.taskLoader`
- **Localização:** `Taskloaders.Module/Loaders.layer/nodejs-package.taskLoader` (EssentialRepo)

## Propósito

*Object loader* do tipo **`nodejs-package`**: carrega um package Node.js e expõe
um *handler* (service object) com `require`, para que outras tasks consumam o
código do package durante a execução de um plano pelo *task executor*.

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `NodeJSPackage.taskLoader.ts` | Carrega o package e monta o handler (`require`, `getSourcePath`, `getEnvironmentPath`, `getNodeModulesPath`). |

## Registro (`metadata/taskloaders.json` do repositório)

| Campo | Valor |
|---|---|
| `objectLoaderType` | `nodejs-package` |
| `entry` | `src/NodeJSPackage.taskLoader` |
| `npmDependencies` | — |

> Parâmetros e exemplo no `execution-params`: ver
> [Tipos de Object Loader → `nodejs-package`](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/concepts/tipos-de-object-loader.md#nodejs-package).
> Para criar o seu próprio loader, veja o
> [Guia: como criar e usar um Object Loader](../../../Runtime.Module/Executor.layer/task-executor.lib/docs/guia-criar-object-loader.md).
> [README do repositório](../../../README.md)
