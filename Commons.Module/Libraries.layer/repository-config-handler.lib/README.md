# repository-config-handler.lib

- **Tipo:** biblioteca (`.lib`) · **Namespace:** `@/repository-config-handler.lib`

Manipula os arquivos de **configuração de repositórios** do ecossistema —
`sources.json` (fontes) e `repositories.json` (instalados) — descritos no
[Ecosystem Data Directory Hierarchy Standard](../../../../../Meta-Platform/meta-platform-open-standard/specifications/ecosystem-data-directory-hierarchy-standard.md).

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
