# repository-config-handler.lib

- **Tipo:** biblioteca (`.lib`)
- **Namespace:** `@/repository-config-handler.lib`
- **Localização:** `Commons.Module/Libraries.layer/repository-config-handler.lib` (EssentialRepo)

## Propósito

Manipula o arquivo **`repositories.json`** (repositórios instalados, incluindo a
fonte de cada um) do ecossistema, descrito no
[Ecosystem Data Directory Hierarchy Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/ecosystem-data-directory-hierarchy-standard.md).
O `sources.json` inicial é criado pelo `ecosystem-install-utilities.lib`; esta lib
opera sobre o `repositories.json` (inclusive `ChangeSourceRepository`, que altera a
fonte registrada nele).

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `GetRepositories.js` | Lê os repositórios registrados/instalados. |
| `RegisterRepositoryInstallation.js` | Registra a instalação de um repositório. |
| `ChangeSourceRepository.js` | Altera a fonte de um repositório. |
| `UpdateRepositoryInstallationPath.js` | Atualiza o caminho de instalação de um repositório. |
| `PrepareRepositoriesFileJson.js` | Prepara/normaliza o arquivo de repositórios. |
| `Helpers/` | Funções auxiliares. |

> Consumido pela CLI `repo` e pelos serviços de gerenciamento de repositórios.
> [README do repositório](../../../README.md)
