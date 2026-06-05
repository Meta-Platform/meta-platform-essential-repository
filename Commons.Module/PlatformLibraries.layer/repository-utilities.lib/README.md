# repository-utilities.lib

- **Tipo:** biblioteca (`.lib`) · **Namespace:** `@/repository-utilities.lib`

Percorre a **hierarquia de um repositório de pacotes**
(`Module → Layer → Group → Package`), listando seus itens. É a base de leitura de
repositórios usada pelos serviços e CLIs de gerenciamento.

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `ListRepositories.js` | Lista os repositórios instalados. |
| `ListModules.js` | Lista os `*.Module` de um repositório. |
| `ListLayers.js` | Lista as `*.layer` de um módulo. |
| `ListPackages.js` | Lista os pacotes de uma layer/group. |
| `Commons/`, `Configs/`, `Helpers/` | Apoio à navegação da hierarquia. |

> Hierarquia formal: [Meta Repository Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/meta-repository-standard.md).
> [README do repositório](../../../README.md)
