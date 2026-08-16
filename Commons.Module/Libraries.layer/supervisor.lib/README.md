# supervisor.lib

- **Tipo:** biblioteca (`.lib`)
- **Namespace:** `@/supervisor.lib`
- **Localização:** `Commons.Module/Libraries.layer/supervisor.lib` (EssentialRepo)

## Propósito

Biblioteca **cliente da interface de supervisão** (gRPC) dos processos: lista e
observa os sockets de supervisão, conecta-se a um processo e consome seu
streaming de log e suas tarefas. É a base da CLI `supervisor`
(`instance-supervisor.cli`).

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `CreateCommunicationInterface.ts` | Cria o cliente gRPC para um socket de supervisão. |
| `ListSocketFilesName.ts` | Lista os sockets de supervisão disponíveis. |
| `WatchSocketDirectory.ts` | Observa o diretório de sockets de supervisão. |
| `TryConnectLogStreaming.ts` | Conecta-se ao streaming de log de um processo. |
| `ConvertTaskResponseToTask.ts` | Converte a resposta gRPC de tarefa no modelo interno. |
| `CreatePrintDataLog.js` / `FormatterDataLog.js` | Formatação/impressão dos logs recebidos. |

> Contrato gRPC: [Package Executor RPC Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/package-executor-rpc-standard.md).
> O `IDL/PackageExecutorRPCSpec.proto` desta lib é uma **cópia de implementação**
> derivada da fonte canônica
> [`proto/package_executor_rpc.proto`](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/proto/package_executor_rpc.proto)
> do Open Standard (sincronização manual, validada por `diff`).
> [README do repositório](../../../README.md)
