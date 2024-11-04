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
const PrintParamsTaskLoader = (params, executorCommandChannel) => {
    const Start = () => {
        executorCommandChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.STARTING)
        console.log("Parameters passed to the loader:")
        console.log(params)
        executorCommandChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.FINISHED)
    }
    const Stop = () => executorCommandChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.TERMINATED)
    executorCommandChannel.on(CommandChannelEventTypes.START_TASK, Start)
    executorCommandChannel.on(CommandChannelEventTypes.STOP_TASK, Stop)
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
    staticParameters:{
        paramA: "valueA",
        paramB: 42,
        paramC: {
            paramX: "valueX",
            paramY: { a:1, b:3, c:5 }
            paramH: ["F", "G", {x:1, k:"t"}]
            paramJ: [1, 2, 3]
        }
        paramI: ["W", "E", {T:1, b:"ç"}]
    }
})
```
#### Resultado da demonstração
```
Parameters passed to the loader:
{
  paramA: 'valueA',
  paramB: 42,
  paramC: { paramX: 'valueX', paramY: { a: 1, b: 3, c: 5 } }
}
```

## Parâmetros Vinculados (`linkedParameters`)
Permitem que parâmetros dinâmicos sejam ajustados conforme mudanças ocorrem, mantendo a tarefa atualizada.(esta errado pois ele é um mapa de parametro que serão passados permite as tarefas compartilharem seu objetos ativos como servidores )

"mostra uso do linkded para adicionando novas rotas a um task loader "

## Regras de Vinculação entre Agentes (`agentLinkRules`)
Determinam como os parâmetros se conectam entre diferentes partes do sistema.

## Regras de Ativação (`activationRules`)
Estabelecem quando a tarefa deve começar, baseado em condições específicas.

## Tarefas Filhas (`children`)
Permite a criação de uma estrutura de tarefas, onde algumas dependem de outras.

## Como o Executor de Tarefas usa os ExecutionParams

O Executor de Tarefas usa os ExecutionParams para criar e gerenciar tarefas. O processo inclui:

1. **Criação da Tarefa**: Usa os ExecutionParams para configurar tudo necessário para a tarefa funcionar.

2. **Configuração da Tarefa**: O Executor de Tarefas prepara a tarefa com base nas informações dos ExecutionParams, como parâmetros e regras.

3. **Execução da Tarefa**: A tarefa espera pelas condições certas para começar, baseado nas regras de ativação dos ExecutionParams.

4. **Gerenciamento do Ciclo de Vida da Tarefa**: Os ExecutionParams também ajudam a decidir como e quando pausar, reiniciar ou terminar uma tarefa.
