[Task Executor README](../README.md)

# API de Referência do Task Executor

O Task Executor fornece uma API flexível e poderosa para gerenciar o ciclo de vida de tarefas. Aqui está um guia detalhado para cada um dos principais métodos disponíveis:

# Índice

- [API de Referência do Task Executor](#api-de-referência-do-task-executor)
- [Índice](#índice)
  - [Criação de Tarefas](#criação-de-tarefas)
    - [`CreateTask(executionParams[, pTaskId])`](#createtaskexecutionparams-ptaskid)
    - [`CreateTasks(executionParamsList[, pTaskId])`](#createtasksexecutionparamslist-ptaskid)
  - [Consulta e Gerenciamento de Tarefas](#consulta-e-gerenciamento-de-tarefas)
    - [`GetTask(taskId)`](#gettasktaskid)
    - [`ListTasks()`](#listtasks)
    - [`StopTask(taskId)`](#stoptasktaskid)
    - [`StopTasks(taskIdList)`](#stoptaskstaskidlist)
  - [Monitoramento de Tarefas](#monitoramento-de-tarefas)
    - [`AddTaskStatusListener(listenerFunction)`](#addtaskstatuslistenerlistenerfunction)

## Instanciação

### `TaskExecutor({ taskLoaders })`

Fábrica do executor. Recebe um objeto com `taskLoaders` (um mapa
`{ objectLoaderType: taskLoader }`; opcional, padrão `[]`) e retorna a instância
com os métodos abaixo (`CreateTask`, `CreateTasks`, `StopTask`, `StopTasks`,
`GetTask`, `ListTasks`, `AddTaskStatusListener`).

## Criação de Tarefas

### `CreateTask(executionParams[, pTaskId])`

Cria uma nova tarefa dentro do Task Executor, permitindo especificar uma série de parâmetros e, opcionalmente, um ID de tarefa pai, caso a nova tarefa seja dependente.

**Parâmetros**:
  - `executionParams` ([ExecutionParams](./execution-params.md)): Objeto contendo as especificações para a execução da tarefa, incluindo:
    - `objectLoaderType` (string): Identifica o tipo de carregador de objeto a ser usado.
    - `staticParameters` (json): Parâmetros estáticos que serão passados ao object loader.
    - `linkedParameters` (linkingRule): Mapa de referências que injeta no `loaderParams` o *service object* vivo de outra task (ex.: `"@@/server-service"`), resolvido em runtime. **Não** são "parâmetros dinâmicos" — ver [ExecutionParams](./execution-params.md#parâmetros-vinculados-linkedparameters).
    - `agentLinkRules` (agentLinkingRule[]): Conjunto de regras para estabelecer a ligação dos parâmetros.
    - `activationRules` (activationRule): Condições sob as quais a tarefa será ativada (lógica `&&` sobre propriedades de outras tasks).
    - `children` ([ExecutionParams](./execution-params.md)[]): Lista de parâmetros de execução para tarefas filhas. Opcional (ausente por padrão).
  - `pTaskId` (integer): ID da tarefa pai, se aplicável.

**Retorno**: array com os `taskId`s criados (a própria task seguida, recursivamente, de seus `children`).

**Exceções**:
  - `Error("The Execution Params cannot be empty")` — se `executionParams` for um objeto vazio.
  - `Error("Task Loader was not found")` — se `objectLoaderType` estiver ausente ou não houver task loader registrado para ele.

### `CreateTasks(executionParamsList[, pTaskId])`

Facilita a criação de múltiplas tarefas em uma operação única, aceitando uma lista de parâmetros de execução.

**Parâmetros**:
- `executionParamsList` ([ExecutionParams](./execution-params.md)[]): Lista contendo os parâmetros de execução para cada tarefa a ser criada.
- `pTaskId` (integer): ID da tarefa pai, para todas as tarefas na lista, se aplicável.

**Retorno**: array com todos os `taskId`s criados.

## Consulta e Gerenciamento de Tarefas

### `GetTask(taskId)`

Retorna informações detalhadas sobre uma tarefa específica, baseado em seu ID.

**Parâmetros**:
- `taskId` (integer): ID da tarefa.

### `ListTasks()`

Lista todas as tarefas gerenciadas pelo Task Executor, fornecendo uma visão geral do estado atual de todas as tarefas.

### `StopTask(taskId)`

Solicita a interrupção de uma tarefa específica, identificada pelo seu ID.

**Parâmetros**:
- `taskId` (integer): ID da tarefa a ser interrompida.

### `StopTasks(taskIdList)`

Permite a interrupção de múltiplas tarefas em uma única operação, passando uma lista de IDs de tarefa.

**Parâmetros**:
- `taskIdList` (integer[]): Lista dos IDs das tarefas a serem interrompidas.

## Monitoramento de Tarefas

### `AddTaskStatusListener(listenerFunction)`

Registra uma função de callback que será chamada sempre que houver uma mudança no status de qualquer tarefa gerenciada pelo Task Executor.

**Parâmetros**:
- `listenerFunction` (function): Função de callback a ser invocada, que recebe **um único objeto** `{ taskId, status, objectLoaderType }`.