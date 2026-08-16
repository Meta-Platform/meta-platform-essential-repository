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

> Parâmetros e exemplo no `execution-params`: ver
> [Tipos de Object Loader → `install-nodejs-package-dependencies`](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/concepts/tipos-de-object-loader.md#install-nodejs-package-dependencies).
> Para criar o seu próprio loader, veja o
> [Guia: como criar e usar um Object Loader](../../Executor.layer/task-executor.lib/docs/guia-criar-object-loader.md).
> [README do repositório](../../../README.md)
