# environment-handler.lib

- **Tipo:** biblioteca (`.lib`)
- **Namespace:** `@/environment-handler.lib`
- **Localização:** `Commons.Module/PlatformLibraries.layer/environment-handler.lib` (EssentialRepo)

## Propósito

Cria e verifica o **diretório de dados do ecossistema** (`EcosystemData`) e os
**ambientes de execução** isolados por pacote (`environments/`), conforme o
[Ecosystem Data Directory Hierarchy Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/ecosystem-data-directory-hierarchy-standard.md).

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `CreateDataDir.ts` / `PrepareDataDir.ts` / `VerifyDataDir.ts` | Cria, prepara e valida o diretório de dados. |
| `CreateEnvironment.ts` / `CreateEnvironmentDir.ts` | Cria um ambiente de execução isolado. |
| `PrepareEnvironmentDir.ts` / `VerifyEnvironmentDir.ts` | Prepara e valida o diretório de um ambiente. |
| `GetEnvironmentPath.ts` | Resolve o caminho de um ambiente: `join(localPath, environmentName)`. |

> [README do repositório](../../../README.md)
