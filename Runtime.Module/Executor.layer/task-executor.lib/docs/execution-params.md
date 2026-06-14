[Task Executor README](../README.md)

# ExecutionParams no `Task Executor`

O ExecutionParams é uma peça chave na organização de tarefas. Ele guarda todas as informações necessárias para uma tarefa rodar bem, incluindo quando ela deve começar e como se conecta com outras tarefas. Aqui, vamos explicar de forma clara o papel dos ExecutionParams.

## O que são os ExecutionParams?

Os ExecutionParams, ou parâmetros de execução, são um conjunto de informações que dizem ao Executor de Tarefas como uma tarefa deve ser preparada, rodar e ser gerenciada. Eles incluem:

- [ExecutionParams no `Task Executor`](#executionparams-no-task-executor)
  - [O que são os ExecutionParams?](#o-que-são-os-executionparams)
  - [Tipo de Carregador de Tarefa (`objectLoaderType`)](#tipo-de-carregador-de-tarefa-objectloadertype)
  - [Parâmetros Estáticos (`staticParameters`)](#parâmetros-estáticos-staticparameters)
    - [Criação do `PrintParamsTaskLoader`](#criação-do-printparamstaskloader)
    - [Demonstrando uso do `staticParameters`](#demonstrando-uso-do-staticparameters)
      - [Resultado da demonstração](#resultado-da-demonstração)
  - [Parâmetros Vinculados (`linkedParameters`)](#parâmetros-vinculados-linkedparameters)
  - [Regras de Vinculação entre Agentes (`agentLinkRules`)](#regras-de-vinculação-entre-agentes-agentlinkrules)
  - [Regras de Ativação (`activationRules`)](#regras-de-ativação-activationrules)
  - [Tarefas Filhas (`children`)](#tarefas-filhas-children)
  - [Como o Executor de Tarefas usa os ExecutionParams](#como-o-executor-de-tarefas-usa-os-executionparams)

## Tipo de Carregador de Tarefa (`objectLoaderType`)
Define qual carregador usar. Isso é fundamental porque o carregador determina as funcionalidades da tarefa. O Executor de Tarefas assegura que a tarefa só será ativada quando estiver pronta, conforme definido pelos ExecutionParams.

Exemplo em código:
```javascript
const taskExecutor = TaskExecutor({
    taskLoaders: {
        "some-task-loader": SomeTaskLoader
    }
})
```
## Parâmetros Estáticos (`staticParameters`)

Os Parâmetros Estáticos são informações estruturadas, tipicamente formatadas como JSON, que o Executor de Tarefas utiliza para passar configurações essenciais ao carregador de tarefas (task loader) no momento em que uma tarefa é inicializada. Essas configurações determinam os requisitos e os dados necessários para a execução adequada da tarefa. Sendo imutáveis após a criação da tarefa, isso garante que a tarefa tenha todas as informações necessárias desde o início.

### Criação do `PrintParamsTaskLoader`

Para exemplificar como os Parâmetros Estáticos são implementados e utilizados na prática, considere o uso do `PrintParamsTaskLoader`. Este carregador foi desenvolvido especificamente para demonstrar a passagem desses parâmetros pelo Executor de Tarefas, ilustrando seu papel crítico na configuração da tarefa.

```javascript
const PrintParamsTaskLoader = (params, executorChannel) => {
    const Start = () => {
        executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.STARTING)
        console.log("Parameters passed to the loader:")
        console.log(params)
        executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.FINISHED)
    }
    const Stop = () => executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.TERMINATED)
    executorChannel.on(CommandChannelEventTypes.START_TASK, Start)
    executorChannel.on(CommandChannelEventTypes.STOP_TASK, Stop)
    return () => {}
}
```
### Demonstrando uso do `staticParameters`
Nessa desmonstração, ao criar uma tarefa com o PrintParamsTaskLoader, especificamos um conjunto de Parâmetros Estáticos. A função `Start` do carregador imprime esses parâmetros, evidenciando a transmissão e utilização das informações fornecidas pelo Executor de Tarefas.

```javascript
const taskExecutor = TaskExecutor({
    taskLoaders: {
        "print-params-task-loader": PrintParamsTaskLoader
    }
})

taskExecutor.CreateTask({
    objectLoaderType: "print-params-task-loader",
    staticParameters: {
        paramA: "valueA",
        paramB: 42,
        paramC: {
            paramX: "valueX",
            paramY: { a: 1, b: 3, c: 5 },
            paramH: ["F", "G", { x: 1, k: "t" }],
            paramJ: [1, 2, 3]
        },
        paramI: ["W", "E", { T: 1, b: "ç" }]
    }
})
```
#### Resultado da demonstração
```
Parameters passed to the loader:
{
  paramA: 'valueA',
  paramB: 42,
  paramC: {
    paramX: 'valueX',
    paramY: { a: 1, b: 3, c: 5 },
    paramH: [ 'F', 'G', { x: 1, k: 't' } ],
    paramJ: [ 1, 2, 3 ]
  },
  paramI: [ 'W', 'E', { T: 1, b: 'ç' } ]
}
```

## Parâmetros Vinculados (`linkedParameters`)

Os `linkedParameters` **não** são "parâmetros que mudam sozinhos". Eles são um
**mapa de referências** que permite a uma task receber, já no seu `loaderParams`,
o **service object vivo de outra task** — por exemplo, um servidor HTTP que já
está no ar, para que a task atual registre novas rotas nele.

Cada chave do mapa aponta para uma referência (ex.: `"@@/server-service"`). O
executor resolve essa referência em runtime: encontra a task que a satisfaz,
chama o `getServiceObject()` dela e injeta o objeto resultante no `loaderParams`
(ver
[`AssembleLinkedTaskParameters`](../src/TaskHandlers/AssembleTaskParameters/AssembleLinkedTaskParameters.js)).
O valor de cada chave pode ser uma string (referência direta) ou um objeto
aninhado de referências.

```json
"linkedParameters": {
  "nodejsPackageHandler": "@/server-manager.webservice",
  "controllerParams": {
    "httpServerService": "@@/server-service"
  },
  "serverService": "@@/server-service"
}
```

No exemplo (extraído do `endpoint-instance`), `serverService` chega ao loader como
o **objeto do servidor já ativo**, permitindo `serverService.AddStaticEndpoint(...)`.
A resolução das referências depende dos `agentLinkRules` (abaixo). O passo a passo
completo está no
[Guia: como criar e usar um Object Loader](./guia-criar-object-loader.md#compartilhando-o-service-object-entre-tasks).

## Regras de Vinculação entre Agentes (`agentLinkRules`)

São as regras que dizem **a qual task** cada referência de `linkedParameters`
corresponde. Cada regra tem um `referenceName` (a mesma string usada no
`linkedParameters`) e um `requirement` — uma expressão `&&` que a task referenciada
precisa satisfazer (tipicamente `status = "ACTIVE"` e um `params.tag` específico):

```json
"agentLinkRules": [
  {
    "referenceName": "@@/server-service",
    "requirement": {
      "&&": [
        { "property": "params.tag", "=": "@@/server-service" },
        { "property": "status",     "=": "ACTIVE" }
      ]
    }
  }
]
```

Além de resolver a injeção do service object, os `agentLinkRules` **gatilham a
ativação**: a task só sai de `AWAITING_PRECONDITIONS` quando as tasks referenciadas
satisfazem seus requisitos (ver
[`IsTaskActivatable`](../src/TaskHandlers/IsTaskActivatable/index.js)).

## Regras de Ativação (`activationRules`)

Estabelecem condições que devem ser verdadeiras para a task ativar, sem injetar
nenhum objeto (diferente de `agentLinkRules`). Usam a mesma sintaxe de expressão
lógica (`&&` / `||`) sobre propriedades de outras tasks. Exemplo típico: um
`nodejs-package` que só carrega depois que a instalação de dependências do mesmo
package terminou (`status = "FINISHED"`).

```json
"activationRules": {
  "&&": [
    { "property": "params.namespace", "=": "@/service-orchestrator.app" },
    { "property": "status",           "=": "FINISHED" }
  ]
}
```

## Tarefas Filhas (`children`)

Array de `ExecutionParams` aninhados. As tasks filhas são criadas
recursivamente com o `taskId` da task atual como `pTaskId` (ver
[`CreateTask`](../src/TaskExecutor.js)). Uma task com filhas (típico de
`application-instance`) só ativa quando **todas as filhas estão ativas** (ver
[`IsTaskActivatable`](../src/TaskHandlers/IsTaskActivatable/index.js)),
formando a hierarquia aplicação → serviços → endpoints.

## Como o Executor de Tarefas usa os ExecutionParams

O Executor de Tarefas usa os ExecutionParams para criar e gerenciar tarefas. O processo inclui:

1. **Criação da Tarefa**: Usa os ExecutionParams para configurar tudo necessário para a tarefa funcionar.

2. **Configuração da Tarefa**: O Executor de Tarefas prepara a tarefa com base nas informações dos ExecutionParams, como parâmetros e regras.

3. **Execução da Tarefa**: A tarefa espera pelas condições certas para começar, baseado nas regras de ativação dos ExecutionParams.

4. **Gerenciamento do Ciclo de Vida da Tarefa**: Os ExecutionParams também ajudam a decidir como e quando pausar, reiniciar ou terminar uma tarefa.
