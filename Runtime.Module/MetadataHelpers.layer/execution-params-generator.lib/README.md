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

## Como um valor de parâmetro é resolvido

`Utils/GetPopulatedParameters` decide o valor de **todo parâmetro de todo
pacote**. Para cada texto encontrado no metadado, nesta ordem:

| Situação | Resultado |
|---|---|
| O texto é o **nome** de um param declarado | O valor cru do param — inclusive `false`, `0`, `""` e objetos. A pergunta é se o param *existe*, não se ele é verdadeiro. |
| O texto começa com `{{` e o template **resolve** | O texto resolvido — inclusive quando o valor herdado é vazio. |
| O texto começa com `{{` e o template **não resolve** | O literal `{{VAR}}`, intocado, para que outra camada da hierarquia ainda possa respondê-lo. |
| Qualquer outro texto | Ele mesmo. |

Distinguir "resolveu para vazio" de "não resolveu" é o motivo de
`Utils/ResolveParamsByString` existir: os dois produzem o mesmo texto (`""`) e
pedem destinos opostos. A pergunta é feita ao próprio Handlebars, no modo
`strict`.

O Handlebars roda com `noEscape`: o destino de um parâmetro é caminho, glob,
URL ou linha de comando — não HTML. Sem isso, um segredo como `k&(#N` chega ao
pacote como `k&amp;(#N`.

## Testes

```
npm test
```

O `handlebars` vem do `EXTERNAL_NODE_MODULES_PATH`; o script usa o caminho do
ecossistema quando a variável não está no ambiente.

> Veja o [Execution Params Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/packages/execution-params-standard.md) e o [README do repositório](../../../README.md).
