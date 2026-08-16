# json-file-utilities.lib

- **Tipo:** biblioteca (`.lib`)
- **Namespace:** `@/json-file-utilities.lib`
- **Localização:** `Commons.Module/Libraries.layer/json-file-utilities.lib` (EssentialRepo)

## Propósito

Utilitários de **leitura e escrita de arquivos JSON**. É uma das libs mais
reutilizadas da plataforma (injetada como `jsonFileUtilitiesLib` em diversas
CLIs e serviços).

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `ReadJsonFile.ts` | Lê e faz o parse de um arquivo JSON. |
| `WriteObjectToFile.ts` | Serializa um objeto e o grava em arquivo. |
| `ListJsonFile.ts` | Lista/lê arquivos JSON de um diretório. |

> [README do repositório](../../../README.md)
