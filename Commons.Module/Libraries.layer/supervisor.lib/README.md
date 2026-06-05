# supervisor.lib

- **Tipo:** biblioteca (`.lib`) · **Namespace:** `@/supervisor.lib`

Biblioteca **cliente da interface de supervisão** (gRPC) dos processos: lista e
observa os sockets de supervisão, conecta-se a um processo e consome seu
streaming de log e suas tarefas. É a base da CLI `supervisor`
(`instance-supervisor.cli`).

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `CreateCommunicationInterface.js` | Cria o cliente gRPC para um socket de supervisão. |
| `ListSocketFilesName.js` | Lista os sockets de supervisão disponíveis. |
| `WatchSocketDirectory.js` | Observa o diretório de sockets de supervisão. |
| `TryConnectLogStreaming.js` | Conecta-se ao streaming de log de um processo. |
| `ConvertTaskResponseToTask.js` | Converte a resposta gRPC de tarefa no modelo interno. |
| `CreatePrintDataLog.js` / `FormatterDataLog.js` | Formatação/impressão dos logs recebidos. |

> Contrato gRPC: [Package Executor RPC Standard](../../../../../Meta-Platform/meta-platform-open-standard/specifications/package-executor-rpc.md).
> Existe um item de planejamento para remover o `MountTaskTable` desta lib (ver
> [`note.md`](../../../../../note.md)). [README do repositório](../../../README.md)
