[Meta Platform Essential Repository](../../../README.md) / [Runtime Module](../../README.md)
# Task Executor

O Task Executor é uma biblioteca projetada para facilitar a gestão e execução de tarefas programáticas de maneira organizada e eficiente. Com foco na flexibilidade e escalabilidade, esta ferramenta oferece um conjunto robusto de funcionalidades para lidar com o ciclo de vida das tarefas, eventos associados, dependências e condições específicas, permitindo aos desenvolvedores construir sistemas complexos de execução de tarefas com facilidade.

## Características Principais

- **Gerenciamento do Ciclo de Vida das Tarefas**: Suporte completo ao ciclo de vida de uma tarefa, incluindo criação, execução, pausa, e finalização.
- **Eventos e Dependências**: Facilidades para lidar com eventos relacionados às tarefas e gerenciar dependências entre elas.
- **Condições de Ativação**: Capacidade de especificar condições sob as quais as tarefas devem ser ativadas ou suspensas.
- **Hierarquia de Tarefas**: Suporte para criação de tarefas em uma estrutura hierárquica, permitindo complexidade organizada e dependências entre tarefas.

## Primeiros Passos com Task Executor: Configurando um Servidor Express Simples
Este exemplo mostra como usar o Task Executor para configurar um servidor Express. Ele oferece um olhar inicial sobre como a ferramenta facilita a organização e execução de tarefas, servindo como um ponto de partida para entender suas funcionalidades básicas.
```javascript
// Importa as dependências necessárias
const express = require('express')
const TaskStatusTypes = require("task-executor.lib/src/TaskStatusTypes")
const TaskExecutor = require("task-executor.lib/src/TaskExecutor")

// Define um loader personalizado para o servidor Express
const ExpressServerTaskLoader = (params, executorCommandChannel) => {
    const app = express()
    let server

    // Inicia o servidor Express
    const Start = () => {
        executorCommandChannel.emit("status", TaskStatusTypes.STARTING)
        app.get('/', (req, res) => res.send('Express server is running!'))
        server = app.listen(params.port, () => {
            console.log(`Express server is listening on port ${params.port}`)
            executorCommandChannel.emit("status", TaskStatusTypes.ACTIVE)
        })
    }

    // Para o servidor Express
    const Stop = () => {
        if (server) {
            executorCommandChannel.emit("status", TaskStatusTypes.STOPPING)
            server.close(() => {
                console.log('Express server has been stopped')
                executorCommandChannel.emit("status", TaskStatusTypes.TERMINATED)
            })
        }
    }

    executorCommandChannel.on("start", Start)
    executorCommandChannel.on("stop", Stop)

    return () => {}
}

// Configura e inicia o Task Executor com o loader personalizado
const taskExecutor = TaskExecutor({
    taskLoaders: {
        "server-task-loader": ExpressServerTaskLoader
    }
})

// Cria e inicia uma nova tarefa para rodar o servidor Express
taskExecutor.CreateTask({
    objectLoaderType: "server-task-loader",
    staticParameters:{
        port: 8081
    }
})

// Agenda para parar o servidor após 15 segundos
setTimeout(() => {
    taskExecutor.StopTask(0)
}, 15000)


```

## API de Referência

- `CreateTask(executionParams[, pTaskId])`: Cria uma nova tarefa.
- `GetTask(taskId)`: Retorna informações sobre uma tarefa específica.
- `ListTasks()`: Lista todas as tarefas criadas.
- `StopTask(taskId)`: Interrompe a execução de uma tarefa.
- `AddTaskStatusListener(listenerFunction)`: Adiciona um listener para mudanças de status nas tarefas.

Para acessar a documentação completa da API de Referência do Task Executor, visite o seguinte link: [API de Referência do Task Executor](./docs/api-referencia.md).

## Status de Tarefas no Task Executor

O Task Executor é uma ferramenta projetada para gerenciar o ciclo de vida das tarefas, desde a sua iniciação até a conclusão. Ele implementa diversos estados para controlar a execução e o monitoramento das tarefas de forma refinada. A seguir, detalhamos cada um dos status que uma tarefa pode apresentar ao longo de seu ciclo de vida.

### `AWAITING_PRECONDITIONS`

Este status indica que a tarefa está em espera, aguardando que condições pré-definidas sejam atendidas antes de dar início à sua execução. Isso assegura que todas as dependências ou requisitos necessários sejam satisfeitos, garantindo uma execução suave e sem interrupções.

### `PRECONDITIONS_COMPLETED`

Uma vez que todas as condições prévias foram atendidas, a tarefa avança para o estado `PRECONDITIONS_COMPLETED`. Este status sinaliza que a tarefa está pronta para ser preparada para iniciar, tendo superado todas as barreiras iniciais para a sua execução.

### `PREPPED_TO_START`

O estado `PREPPED_TO_START` é atribuído às tarefas que foram preparadas para iniciar. Isso indica que todos os preparativos necessários foram concluídos, e a tarefa está prestes a entrar em execução.

### `STARTING`

Quando a tarefa está no processo de iniciar, ela é designada como `STARTING`. Este é um estado transitório que leva a tarefa ao estado `ACTIVE` ou diretamente para `FINISHED`, dependendo da natureza e da duração da tarefa.

### `ACTIVE`

O status `ACTIVE` é utilizado para tarefas que necessitam permanecer em operação contínua, como é o caso de serviços ou daemons. Este estado indica que a tarefa está atualmente em execução e deve continuar assim até que uma ação explícita seja tomada para interrompê-la.

### `STOPPING`

`STOPPING` é o estado atribuído a tarefas que estão no processo de serem interrompidas. Este status é geralmente alcançado após um comando explícito para parar a tarefa, iniciando o processo de encerramento de suas operações.

### `FINISHED`

O estado `FINISHED` é aplicável a tarefas que têm um objetivo específico a ser alcançado e são concluídas após sua execução, como tarefas de processamento de dados ou instalação de software. Este status indica que a tarefa cumpriu seu propósito e foi concluída com sucesso.

### `FAILURE`

Quando ocorre uma falha durante o processo de execução, a tarefa é designada como `FAILURE`. Este status indica que a tarefa não conseguiu ser concluída conforme o esperado devido a erros ou problemas durante sua execução.

### `TERMINATED`

O status `TERMINATED` refere-se a tarefas que foram forçadas a terminar antes de alcançarem um estado de conclusão natural, ou que foram interrompidas por ação do usuário. Isso pode ocorrer tanto para tarefas de execução única quanto para tarefas contínuas, indicando que a tarefa foi deliberadamente finalizada antes do previsto.

Entender esses estados é crucial para gerenciar efetivamente o ciclo de vida das tarefas, permitindo que os desenvolvedores implementem lógicas específicas baseadas no progresso ou conclusão das tarefas.
