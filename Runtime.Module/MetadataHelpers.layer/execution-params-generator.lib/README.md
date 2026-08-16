# execution-params-generator.lib

- **Tipo:** biblioteca (`.lib`)
- **Namespace:** `@/execution-params-generator.lib`
- **Localização:** `Runtime.Module/MetadataHelpers.layer/execution-params-generator.lib` (EssentialRepo)

## Propósito

Traduz a **hierarquia de metadados** de um pacote — produzida pela
[`@/dependency-graph-builder.lib`](../dependency-graph-builder.lib) — nos
**parâmetros de execução** que o *task executor* consome para montar o plano de
tarefas.

É o elo entre o que está declarado nos `metadata/` (serviços, endpoints,
executáveis, janelas) e o que efetivamente vira tarefa em runtime: cada tipo de
nó da hierarquia tem um gerador próprio de parâmetros.

A função de entrada é `TranslateMetadataHierarchyForExecutionParams`.

## Exports (`src/`)

| Módulo | Responsabilidade |
|---|---|
| `TranslateMetadataHierarchyForExecutionParams.ts` | Entrada: percorre a hierarquia de metadados e devolve os parâmetros de execução. |
| `GenerateExecutionParamsForApplicationService/` | Gera os parâmetros de uma aplicação: serviços, endpoints, executáveis, comandos e janelas. |
| `GenerateExecutionParamsForNodejsPackageServices.ts` | Gera os parâmetros dos serviços de um pacote Node.js. |
| `GenerateExecutionParamsForPrepareEnvironment.ts` | Gera os parâmetros da etapa de preparação do ambiente. |
| `Utils/` | Substituição de parâmetros por string (`{{VAR}}`), extração de namespace/caminho e povoamento de parâmetros. |

> Veja o [Execution Params Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/packages/execution-params-standard.md) e o [README do repositório](../../../README.md).
