# task-table-render.lib

- **Tipo:** biblioteca (`.lib`) · **Namespace:** `@/task-table-render.lib`

Renderiza **tabelas de tarefas** (tasks) no terminal para as CLIs de execução e
supervisão — exibindo parâmetros estáticos, parâmetros vinculados, regras de
ativação e de *agent link*. Injetada como `taskTableRenderLib`.

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `MountTaskTable.js` | Monta a tabela completa de uma task. |
| `CreateAttributeTable.js` | Cria uma tabela de atributos. |
| `RenderGeneralInformationTaskTable.js` | Renderiza informações gerais. |
| `RenderStaticParametersTaskTable.js` | Renderiza `staticParameters`. |
| `RenderLinkedParametersTaskTable.js` | Renderiza `linkedParameters`. |
| `RenderActivationRulesTaskTable.js` | Renderiza `activationRules`. |
| `RenderAgentLinkRulesTaskTable.js` | Renderiza `agentLinkRules`. |
| `GetColorLogByStatus.js` | Define a cor conforme o status da task. |

> Campos de task: ver [Execution Params Standard](../../../../../Meta-Platform/meta-platform-open-standard/specifications/packages/execution-params-standard.md).
> [README do repositório](../../../README.md)
