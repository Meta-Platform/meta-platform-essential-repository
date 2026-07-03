[Task Executor README](../README.md) / [Runtime Module](../../../README.md)

# Guia: como criar e usar um Object Loader (Task Loader)

Este é o **passo a passo prático** para criar um *object loader* — também chamado
de *task loader* — e registrá-lo no [Task Executor](../README.md). Para a
referência conceitual dos tipos já existentes, veja
[Tipos de Object Loader](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/concepts/tipos-de-object-loader.md);
para o formato do plano de execução, veja
[ExecutionParams](./execution-params.md) e o
[Execution Params Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/packages/execution-params-standard.md).

> **Object loader e task loader são o mesmo conceito.** "Object loader" é o nome
> do *tipo* declarado no `execution-params.json` (campo `objectLoaderType`);
> "task loader" é o nome da *função* que implementa esse tipo. Ao longo deste guia
> usamos os dois termos de forma intercambiável.

## Índice

- [O que é um Object Loader](#o-que-é-um-object-loader)
- [O contrato da função](#o-contrato-da-função)
  - [`loaderParams`](#loaderparams)
  - [`executorChannel` — o canal de comando](#executorchannel--o-canal-de-comando)
  - [O retorno: `getServiceObject`](#o-retorno-getserviceobject)
- [O ciclo de vida de uma task](#o-ciclo-de-vida-de-uma-task)
- [Passo a passo: criando um object loader](#passo-a-passo-criando-um-object-loader)
  - [1. Escolha o padrão de tempo de vida](#1-escolha-o-padrão-de-tempo-de-vida)
  - [2. Escreva a função do loader](#2-escreva-a-função-do-loader)
  - [3. Registre o loader no Task Executor](#3-registre-o-loader-no-task-executor)
  - [4. Crie uma task usando o loader](#4-crie-uma-task-usando-o-loader)
- [Recebendo dados: parâmetros estáticos e vinculados](#recebendo-dados-parâmetros-estáticos-e-vinculados)
  - [Compartilhando o service object entre tasks](#compartilhando-o-service-object-entre-tasks)
- [Empacotando como uma `.lib` da plataforma](#empacotando-como-uma-lib-da-plataforma)
- [Checklist e armadilhas comuns](#checklist-e-armadilhas-comuns)
- [Object loaders de referência](#object-loaders-de-referência)

---

## O que é um Object Loader

O Task Executor não sabe **como** iniciar um serviço HTTP, instalar dependências
ou subir uma CLI. Ele só sabe **orquestrar** tasks: criá-las, esperar pré-condições,
ativá-las na ordem certa e acompanhar o status. Quem sabe *o que fazer* em cada
unidade de execução é o **object loader**.

Um object loader é uma função que:

1. recebe os **parâmetros** já resolvidos da task e um **canal de eventos**;
2. registra o que fazer quando a task for **iniciada** (`START_TASK`) e **parada**
   (`STOP_TASK`);
3. reporta o progresso emitindo mudanças de status (`CHANGE_TASK_STATUS`).

Cada object loader é associado a um `objectLoaderType` (uma string) num mapa
passado ao `TaskExecutor`. No `execution-params.json`, cada unidade declara qual
`objectLoaderType` deve carregá-la.

## O contrato da função

```javascript
const MeuObjectLoader = (loaderParams, executorChannel) => {

    const Start = () => { /* ... */ }
    const Stop  = () => { /* ... */ }

    executorChannel.on(CommandChannelEventTypes.START_TASK, Start)
    executorChannel.on(CommandChannelEventTypes.STOP_TASK,  Stop)

    return () => serviceObject   // getServiceObject
}

module.exports = MeuObjectLoader
```

A função é chamada **uma vez por task**, no momento em que a task é preparada para
ativação (estado `PRECONDITIONS_COMPLETED`). Nesse momento ela apenas **registra
os listeners** e devolve `getServiceObject`. O trabalho de verdade só acontece
quando o executor emite `START_TASK`.

### `loaderParams`

É o objeto de parâmetros **já montado** pelo executor. Ele é o resultado do
*merge profundo* de `staticParameters` com os `linkedParameters` já resolvidos
(ver [`AssembleTaskParameters`](../src/TaskHandlers/AssembleTaskParameters/index.js)).
Ou seja: dentro do loader, parâmetros estáticos e vinculados chegam **achatados no
mesmo objeto** — você não precisa olhar para `staticParameters`/`linkedParameters`
separadamente.

### `executorChannel` — o canal de comando

É um `EventEmitter` ([`node:events`](https://nodejs.org/api/events.html)) exclusivo
da task. Os tipos de evento estão em
[`CommandChannelEventTypes`](../src/CommandChannelEventTypes.js):

| Evento | Direção | Significado |
|--------|---------|-------------|
| `START_TASK` | executor → loader | A task deve iniciar. Registre um listener. |
| `STOP_TASK` | executor → loader | A task deve parar. Registre um listener. |
| `CHANGE_TASK_STATUS` | loader → executor | Reporta um novo `TaskStatus` (você **emite**). |
| `STOP_ALL_TASKS` | loader → executor | Pede o encerramento de **todo** o plano (raro; usado por CLIs). |

> Você também pode **escutar** `CHANGE_TASK_STATUS` para reagir ao próprio status
> da task (por exemplo, marcar uma flag `wasStopped` quando entrar em `STOPPING`).
> É o que fazem o `install-nodejs-package-dependencies` e o `endpoint-instance`.

### O retorno: `getServiceObject`

A função deve retornar **outra função** que devolve o "service object" vivo da
task — aquilo que outras tasks podem consumir via [`linkedParameters`](#compartilhando-o-service-object-entre-tasks).

- Se o seu loader expõe algo para os outros (um servidor, um handler de pacote),
  retorne `() => serviceObject`.
- Se ele não expõe nada (uma instalação, uma CLI), retorne `() => {}`.

## O ciclo de vida de uma task

O executor conduz cada task pelos estados de
[`TaskStatusTypes`](../src/TaskStatusTypes.js). O fluxo controlado pelo executor
(ver [`ProcessChangeTaskEvents`](../src/ProcessChangeTaskEvents.js)) é:

```
CreateTask
   │
   ▼
AWAITING_PRECONDITIONS        ← espera linkedParameters / agentLinkRules /
   │  (IsTaskActivatable?)       activationRules / filhas ativas
   ▼
PRECONDITIONS_COMPLETED       ← executor monta os params e CHAMA o loader,
   │                             registrando os listeners
   ▼
PREPPED_TO_START              ← executor emite START_TASK no canal
   │
   ▼   (a partir daqui quem dita o status é o LOADER)
STARTING ──► ACTIVE ──► STOPPING ──► TERMINATED   (serviço de longa duração)
        └──► FINISHED                              (tarefa de execução única)
        └──► FAILURE                               (erro)
```

Os estados **antes** de `PREPPED_TO_START` são gerenciados pelo executor. A partir
do `START_TASK`, **é o loader quem emite** os status via
`CHANGE_TASK_STATUS`. As regras importantes:

- Reportar `ACTIVE` é o que libera tasks dependentes (que esperavam por
  `activationRules`/`agentLinkRules` apontando para esta task) — o executor
  re-avalia as pré-condições de todas as tasks em espera a cada `ACTIVE`/`FINISHED`.
- `FINISHED` é para tarefas com fim (instalação, CLI); `ACTIVE` é para serviços
  que permanecem no ar.
- `TERMINATED` é o desfecho de uma parada solicitada; `FAILURE` é erro.

A descrição completa de cada estado está no
[README do Task Executor](../README.md#status-de-tarefas-no-task-executor).

## Passo a passo: criando um object loader

Vamos criar um loader `delayed-printer` que imprime uma mensagem após um atraso e
então **termina** — um bom exemplo do padrão de execução única.

### 1. Escolha o padrão de tempo de vida

Antes de escrever, decida qual é o comportamento da task. Os três padrões
canônicos:

| Padrão | Start emite | Stop emite | Exemplo na plataforma |
|--------|-------------|------------|------------------------|
| **Execução única** | `STARTING` → … → `FINISHED` | `TERMINATED` | `install-nodejs-package-dependencies`, `command-application` |
| **Serviço de longa duração** | `STARTING` → `ACTIVE` | `STOPPING` → `TERMINATED` | `service-instance`, `endpoint-instance` |
| **Marcador imediato** | `ACTIVE` | `TERMINATED` | `application-instance` |

Nosso `delayed-printer` é de **execução única**.

### 2. Escreva a função do loader

```javascript
const TaskStatusTypes          = require("task-executor.lib/src/TaskStatusTypes")
const CommandChannelEventTypes = require("task-executor.lib/src/CommandChannelEventTypes")

const DelayedPrinterTaskLoader = (loaderParams, executorChannel) => {

    const { message, delayMs = 1000 } = loaderParams

    let timer
    let wasStopped = false

    const Start = () => {
        executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.STARTING)
        timer = setTimeout(() => {
            console.log(message)
            // se já pediram para parar durante a espera, encerramos como TERMINATED
            const finalStatus = wasStopped ? TaskStatusTypes.TERMINATED : TaskStatusTypes.FINISHED
            executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, finalStatus)
        }, delayMs)
    }

    const Stop = () => {
        wasStopped = true
        if (timer) clearTimeout(timer)
        executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.TERMINATED)
    }

    executorChannel.on(CommandChannelEventTypes.START_TASK, Start)
    executorChannel.on(CommandChannelEventTypes.STOP_TASK,  Stop)

    return () => {}   // não expõe service object
}

module.exports = DelayedPrinterTaskLoader
```

Pontos a observar:

- **Nada de trabalho pesado fora de `Start`.** O corpo da função roda na fase de
  preparação; coloque a lógica em `Start`/`Stop`.
- **Sempre chegue a um estado terminal** (`FINISHED`/`TERMINATED`/`FAILURE`). Uma
  task que nunca reporta um desfecho trava as dependentes e a parada do plano.
- **Envolva o trabalho em `try/catch`** e emita `FAILURE` no erro (veja os loaders
  de referência).

### 3. Registre o loader no Task Executor

O executor recebe um mapa `objectLoaderType → função`:

```javascript
const TaskExecutor = require("task-executor.lib/src/TaskExecutor")

const taskExecutor = TaskExecutor({
    taskLoaders: {
        "delayed-printer": DelayedPrinterTaskLoader
    }
})
```

Na plataforma, esse mapa é montado em dois pontos (ambos no
[ecosystem-core-repository](https://github.com/Meta-Platform/meta-platform-ecosystem-core-repository)),
carregando cada loader como uma `.lib`:

- [`StandardTaskExecutorMachine.service`](https://github.com/Meta-Platform/meta-platform-ecosystem-core-repository/blob/main/Main.Module/Services.layer/task-executor-machine.service/src/Services/StandardTaskExecutorMachine.service.js)
  (a máquina de execução usada pelo supervisor);
- [`RunPackage.command`](https://github.com/Meta-Platform/meta-platform-ecosystem-core-repository/blob/main/Main.Module/PackageApplication.layer/package-runner.cli/src/Commands/RunPackage.command.js)
  (a CLI `package-runner`).

Para que um **novo** loader essencial seja reconhecido pela plataforma, você o
adiciona a esse mapa (e às dependências `bound-params` do serviço). Para um loader
de uso pontual, basta passá-lo no mapa do seu próprio `TaskExecutor`, como acima.

### 4. Crie uma task usando o loader

```javascript
taskExecutor.CreateTask({
    objectLoaderType: "delayed-printer",
    staticParameters: {
        message: "Olá do object loader!",
        delayMs: 1500
    }
})
```

Se o `objectLoaderType` não estiver no mapa, o executor lança
`"Task Loader was not found"` (ver [`TaskExecutor.CreateTask`](../src/TaskExecutor.js)).

## Recebendo dados: parâmetros estáticos e vinculados

Os parâmetros que chegam em `loaderParams` vêm de dois lugares do `executionParams`
(detalhados em [ExecutionParams](./execution-params.md)):

- **`staticParameters`** — valores fixos, conhecidos no momento da criação da task
  (caminhos, nomes, portas, flags). É o caso mais comum.
- **`linkedParameters`** — referências a **service objects vivos de outras tasks**,
  resolvidas em runtime e injetadas no `loaderParams`.

### Compartilhando o service object entre tasks

É aqui que o retorno `getServiceObject` ganha sentido. Uma task expõe um objeto;
outra task o recebe como parâmetro. O mecanismo (ver
[`AssembleLinkedTaskParameters`](../src/TaskHandlers/AssembleTaskParameters/AssembleLinkedTaskParameters.js)
e [`GetTaskServiceObject`](../src/TaskHandlers/AssembleTaskParameters/GetTaskServiceObject.js)):

1. Em `linkedParameters`, o valor é uma **referência** (ex.: `"@@/server-service"`).
2. Em `agentLinkRules`, há uma regra com `referenceName` igual a essa referência e
   um `requirement` (ex.: a task referenciada precisa estar `ACTIVE`).
3. O executor localiza a task que satisfaz o requisito, chama o seu
   `getServiceObject()` e injeta o **objeto vivo** no `loaderParams` do consumidor.

Exemplo real: o `endpoint-instance` recebe o objeto do servidor HTTP
(`serverService`) já no ar e chama `serverService.AddStaticEndpoint(...)`. Para
expor um objeto assim, basta o seu loader **retornar** `() => serviceObject` —
como faz o [`service-instance`](https://github.com/Meta-Platform/meta-platform-essential-repository/blob/main/Runtime.Module/EssentialTaskLoaders.layer/service-instance.lib/src/ServiceInstance.taskLoader.js).

> Os `agentLinkRules` também **bloqueiam a ativação**: a task com
> `linkedParameters`/`agentLinkRules` só sai de `AWAITING_PRECONDITIONS` quando as
> tasks referenciadas satisfazem seus requisitos (ver
> [`IsTaskActivatable`](../src/TaskHandlers/IsTaskActivatable/index.js)). Use
> `activationRules` para condições que não dependem de injetar um objeto.

## Empacotando como uma `.lib` da plataforma

Os object loaders essenciais vivem em
`Runtime.Module/EssentialTaskLoaders.layer/<nome>.lib` no
[essential-repository](https://github.com/Meta-Platform/meta-platform-essential-repository).
Para criar o seu seguindo a mesma convenção:

```
meu-loader.lib/
├── metadata/
│   └── package.json        # metadados do pacote (apenas namespace, ex.: @/meu-loader.lib)
├── package.json
├── README.md
└── src/
    └── MeuLoader.taskLoader.js
```

- O arquivo de código segue o sufixo **`.taskLoader.js`** e exporta a função.
- Registre-o no mapa de `taskLoaders` com um `objectLoaderType` estável (é o
  contrato público — ele aparece no `execution-params.json`).
- Documente os parâmetros do loader (ver
  [Tipos de Object Loader](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/concepts/tipos-de-object-loader.md)).

Para o passo a passo geral de criação de pacotes, veja o
[Guia de Criar Pacote](https://github.com/Meta-Platform/.github/blob/main/docs/GUIA-CRIAR-PACOTE.md).

## Checklist e armadilhas comuns

- [ ] A função tem a assinatura `(loaderParams, executorChannel) => getServiceObject`.
- [ ] Registra listeners para `START_TASK` **e** `STOP_TASK`.
- [ ] O trabalho de verdade está em `Start`/`Stop`, **não** no corpo da função.
- [ ] Toda execução chega a `FINISHED`, `TERMINATED` ou `FAILURE`.
- [ ] Serviços de longa duração emitem `ACTIVE` (e só assim liberam dependentes).
- [ ] Erros são capturados e reportados como `FAILURE`.
- [ ] `Stop` trata o caso de a task ainda não ter iniciado ou já ter terminado.
- [ ] O `objectLoaderType` foi adicionado ao mapa de `taskLoaders`.
- [ ] Se o loader expõe algo, `getServiceObject` devolve o objeto vivo; senão,
      `() => {}`.

**Armadilha clássica:** esquecer de emitir um status terminal. Como o executor
re-avalia as pré-condições a cada `ACTIVE`/`FINISHED`, uma task "presa" em
`STARTING` impede que as dependentes ativem e que o plano pare de forma limpa.

## Object loaders de referência

Estude os loaders essenciais — cada um ilustra um padrão:

| Loader | Padrão | O que aprender |
|--------|--------|----------------|
| [`application-instance`](https://github.com/Meta-Platform/meta-platform-essential-repository/blob/main/Runtime.Module/EssentialTaskLoaders.layer/application-instance.lib/src/ApplicationInstance.taskLoader.js) | Marcador imediato | O loader mínimo: `ACTIVE` no start, `TERMINATED` no stop. |
| [`install-nodejs-package-dependencies`](https://github.com/Meta-Platform/meta-platform-essential-repository/blob/main/Runtime.Module/EssentialTaskLoaders.layer/install-nodejs-package-dependencies.lib/src/InstallNodejsPackageDependencies.taskLoader.js) | Execução única assíncrona | `try/catch`, flags de estado, `FINISHED` vs `TERMINATED`. |
| [`nodejs-package`](https://github.com/Meta-Platform/meta-platform-essential-repository/blob/main/Runtime.Module/EssentialTaskLoaders.layer/nodejs-package.lib/src/NodeJSPackage.taskLoader.js) | Expõe service object | Retornar um objeto com `.require` para outras tasks. |
| [`service-instance`](https://github.com/Meta-Platform/meta-platform-essential-repository/blob/main/Runtime.Module/EssentialTaskLoaders.layer/service-instance.lib/src/ServiceInstance.taskLoader.js) | Serviço de longa duração | `onReady`/`onClose` → `ACTIVE`/`TERMINATED`; expor o objeto do serviço. |
| [`endpoint-instance`](https://github.com/Meta-Platform/meta-platform-essential-repository/blob/main/Runtime.Module/EssentialTaskLoaders.layer/endpoint-instance.lib/src/EndpointInstance.taskLoader.js) | Consome service object | Receber `serverService` via `linkedParameters` e usá-lo. |
| [`command-application`](https://github.com/Meta-Platform/meta-platform-essential-repository/blob/main/Runtime.Module/EssentialTaskLoaders.layer/command-application.lib/src/CommandApplication.taskLoader.js) | CLI | `FINISHED` + `STOP_ALL_TASKS` para encerrar o plano inteiro. |
| [`desktop-window-instance`](https://github.com/Meta-Platform/meta-platform-essential-repository/blob/main/Runtime.Module/EssentialTaskLoaders.layer/desktop-window-instance.lib/src/DesktopWindowInstance.taskLoader.js) | Serviço de longa duração | `spawn` do Electron; abre a janela via `loadURL` (app web local que sobe junto) ou `loadFile` (HTML estático); `ACTIVE` enquanto a janela está aberta; emite `TERMINATED` (da própria task) quando a janela é fechada. |

---

> Veja também: [ExecutionParams](./execution-params.md) ·
> [API de Referência](./api-referencia.md) ·
> [Tipos de Object Loader](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/concepts/tipos-de-object-loader.md) ·
> [Environment Runtime Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/environment-runtime-standard.md).
</content>
</invoke>
