# environment-handler.lib

- **Tipo:** biblioteca (`.lib`) · **Namespace:** `@/environment-handler.lib`

Cria e verifica o **diretório de dados do ecossistema** (`EcosystemData`) e os
**ambientes de execução** isolados por pacote (`environments/`), conforme o
[Ecosystem Data Directory Hierarchy Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/ecosystem-data-directory-hierarchy-standard.md).

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `CreateDataDir.js` / `PrepareDataDir.js` / `VerifyDataDir.js` | Cria, prepara e valida o diretório de dados. |
| `CreateEnvironment.js` / `CreateEnvironmentDir.js` | Cria um ambiente de execução isolado. |
| `PrepareEnvironmentDir.js` / `VerifyEnvironmentDir.js` | Prepara e valida o diretório de um ambiente. |
| `GetEnvironmentPath.js` | Resolve o caminho de um ambiente (nome + hash). |

> [README do repositório](../../../README.md)
