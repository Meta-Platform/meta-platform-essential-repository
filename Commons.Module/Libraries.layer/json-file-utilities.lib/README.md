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
| `ReadJsonFile.js` | Lê e faz o parse de um arquivo JSON. |
| `WriteObjectToFile.js` | Serializa um objeto e o grava em arquivo. |
| `ListJsonFile.js` | Lista/lê arquivos JSON de um diretório. |

> [README do repositório](../../../README.md)
