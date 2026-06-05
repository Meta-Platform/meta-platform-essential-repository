# print-data-log.lib

- **Tipo:** biblioteca (`.lib`) · **Namespace:** `@/print-data-log.lib`

Impressão de **logs formatados e coloridos** no terminal, no formato
`[data] [origem] [tipo] [fonte] mensagem`. É a lib de log padrão das CLIs e
serviços (injetada como `printDataLogLib`).

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `PrintDataLog.js` | Recebe `{ sourceName, type, message }` e imprime o log formatado. |

> [README do repositório](../../../README.md)
