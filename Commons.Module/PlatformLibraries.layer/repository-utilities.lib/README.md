# repository-utilities.lib

- **Tipo:** biblioteca (`.lib`)
- **Namespace:** `@/repository-utilities.lib`
- **Localização:** `Commons.Module/PlatformLibraries.layer/repository-utilities.lib` (EssentialRepo)

## Propósito

Percorre a **hierarquia de um repositório de pacotes**
(`Module → Layer → Group → Package`), listando seus itens. É a base de leitura de
repositórios usada pelos serviços e CLIs de gerenciamento.

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `ListRepositories.ts` | Lista os repositórios instalados. |
| `ListModules.ts` | Lista os `*.Module` de um repositório. |
| `ListLayers.ts` | Lista as `*.layer` de um módulo. |
| `ListPackages.ts` | Lista os pacotes de uma layer/group. |
| `Commons/`, `Configs/`, `Helpers/` | Apoio à navegação da hierarquia. |

> Hierarquia formal: [Meta Repository Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/meta-repository-standard.md).
> [README do repositório](../../../README.md)
