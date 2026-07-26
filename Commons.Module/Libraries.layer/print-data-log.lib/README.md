# print-data-log.lib

- **Tipo:** biblioteca (`.lib`)
- **Namespace:** `@/print-data-log.lib`
- **Localização:** `Commons.Module/Libraries.layer/print-data-log.lib` (EssentialRepo)

## Propósito

Impressão de **logs formatados e coloridos** no terminal, no formato
`[data] [origem] [tipo] [fonte] mensagem`. É a lib de log padrão das CLIs e
serviços (injetada como `printDataLogLib`).

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `PrintDataLog.js` | `PrintDataLog(dataLog, eventOrigin)`: recebe `dataLog` (`{ sourceName, type, message }`) e `eventOrigin` (a `[origem]` do formato) e imprime o log formatado. |

> [README do repositório](../../../README.md)
