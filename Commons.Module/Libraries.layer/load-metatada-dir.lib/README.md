# load-metatada-dir.lib

- **Tipo:** biblioteca (`.lib`)
- **Namespace:** `@/load-metatada-dir.lib`
- **Localização:** `Commons.Module/Libraries.layer/load-metatada-dir.lib` (EssentialRepo)

## Propósito

Carrega o conteúdo de um diretório de [metadados](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/concepts/metadata.md)
de um pacote, tornando seus metadados disponíveis para a plataforma.

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `LoadMetadataDir.ts` | `LoadMetadataDir({ metadataDirName, path })`: lê os arquivos de metadados de um pacote. O nome do diretório é **parametrizável** por `metadataDirName` (tipicamente `metadata/`). |

> [README do repositório](../../../README.md)
