# task-table-render.lib

- **Tipo:** biblioteca (`.lib`)
- **Namespace:** `@/task-table-render.lib`
- **Localização:** `Commons.Module/Utilities.layer/task-table-render.lib` (EssentialRepo)

## Propósito

Renderiza **tabelas de tarefas** (tasks) no terminal para as CLIs de execução e
supervisão — exibindo parâmetros estáticos, parâmetros vinculados, regras de
ativação e de *agent link*. Injetada como `taskTableRenderLib`.

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `MountTaskTable.ts` | Monta a tabela completa de uma task. |
| `CreateAttributeTable.ts` | Cria uma tabela de atributos. |
| `RenderGeneralInformationTaskTable.ts` | Renderiza informações gerais. |
| `RenderStaticParametersTaskTable.ts` | Renderiza `staticParameters`. |
| `RenderLinkedParametersTaskTable.ts` | Renderiza `linkedParameters`. |
| `RenderActivationRulesTaskTable.ts` | Renderiza `activationRules`. |
| `RenderAgentLinkRulesTaskTable.ts` | Renderiza `agentLinkRules`. |
| `GetColorLogByStatus.ts` | Define a cor conforme o status da task. |

> Campos de task: ver [Execution Params Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/packages/execution-params-standard.md).
> [README do repositório](../../../README.md)
