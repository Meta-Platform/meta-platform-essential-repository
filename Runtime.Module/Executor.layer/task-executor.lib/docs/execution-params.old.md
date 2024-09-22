# ExecutionParams no Task Executor

Um componente crucial na criação de tarefas é o objeto `ExecutionParams`, que contém todas as especificações necessárias para a execução de uma tarefa e todos os aspectos envolvidos como regras de ativação e como as tarefas interagem entre si. Este documento visa explicar detalhadamente a estrutura dos `ExecutionParams`.

## Estrutura do ExecutionParams

Os `ExecutionParams` ou parametros de execução são definidos por várias propriedades que determinam como uma tarefa será carregada, executada, e gerenciada dentro do Task Executor. Abaixo está a descrição detalhada de cada propriedade:

- `objectLoaderType`: Especifica o tipo de carregador de tarefas a ser usado. Isso determina qual a funcionalidade a tarefa terá pois o coração da tarefa aonde ocorre a execução é carregado pelo task loader, o TaskExecutor garante que a tarefas só sera ativada quando as condições necessárias de acordo com os parametros de execução.

```javascript
const taskExecutor = TaskExecutor({
    taskLoaders:{
        "minimum-task-loader": MinimumTaskLoader
    }
})
```


- `staticParameters` (json): Define os parâmetros estáticos que serão passados ao carregador de objeto. Estes parâmetros não mudam ao longo do tempo e são definidos no momento da criação da tarefa.

- `linkedParameters` (linkingRule): Contém as regras para o mapeamento de parâmetros dinâmicos. Isso permite que os parâmetros de uma tarefa sejam vinculados a valores ou estados que podem mudar ao longo do tempo.

- `agentLinkRules` (agentLinkingRule[]): Conjunto de regras que estabelecem como os parâmetros serão vinculados entre diferentes agentes ou componentes do sistema.

- `activationRules` (activationRule): Define as condições sob as quais a tarefa será ativada. Isso inclui pré-condições que devem ser satisfeitas para que a tarefa comece sua execução.

- `children` (ExecutionParams[]): Lista opcional de `ExecutionParams` para tarefas filhas. Isso permite a criação de uma hierarquia de tarefas, onde tarefas parentais podem ter tarefas filhas dependentes.

## Utilização no Task Executor

O `Task Executor` utiliza os `ExecutionParams` como parte do método `CreateTask`, que é responsável por criar novas tarefas. O processo é detalhado a seguir:

1. **Criação de Tarefa**: Ao chamar `CreateTask`, os `ExecutionParams` são passados como argumento, fornecendo todas as informações necessárias para a configuração e execução da tarefa.

2. **Configuração da Tarefa**: O Task Executor analisa os `ExecutionParams` e configura a tarefa conforme especificado, incluindo a definição de parâmetros estáticos e dinâmicos, regras de vinculação, e condições de ativação.

3. **Execução da Tarefa**: Uma vez configurada, a tarefa é preparada para execução, aguardando que suas condições de ativação sejam satisfeitas. Dependendo das regras definidas nos `ExecutionParams`, a tarefa pode ser executada imediatamente ou aguardar a ocorrência de determinados eventos ou condições.

4. **Gerenciamento de Ciclo de Vida**: Os `ExecutionParams` também podem influenciar o ciclo de vida da tarefa, determinando como e quando uma tarefa é pausada, reiniciada ou finalizada.

## Conclusão

Os `ExecutionParams` desempenham um papel fundamental no Task Executor, permitindo uma flexibilidade e precisão sem precedentes na definição de como as tarefas são executadas e gerenciadas. Compreender sua estrutura e uso é essencial para o desenvolvimento de sistemas complexos de execução de tarefas.
