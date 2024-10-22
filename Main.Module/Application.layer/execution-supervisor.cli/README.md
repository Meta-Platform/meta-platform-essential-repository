[Meta Platform Essential Repository](../../../README.md) / [Main Module](../../README.md)

# Execution Supervisor

O ***Execution Supervisor*** é responsável pela análise e supervisão de aplicações compatíveis com o ecossistema **Meta Platform**, especificamente aquelas executadas pelo *package-executor*. As aplicações gerenciadas por ele podem expor um socket de comunicação, permitindo que o supervisor interaja diretamente com a aplicação em execução. Essa interação é facilitada pelo acesso à instância por meio de um arquivo `.sock`, que é especificado no momento da execução da instância.

## Comandos Disponíveis
```bash

# Listar sockets
supervisor sockets

# Mostrar status
supervisor status --socket [SOCKET_FILENAME]

# Listar tarefas
supervisor tasks --socket [SOCKET_FILENAME]

# Visualizar logs
supervisor log --socket [SOCKET_FILENAME]

# Matar Execução
supervisor kill --socket [SOCKET_FILENAME]

# Detalhar informações de tarefas
supervisor show task [TASK_ID] --socket "<SOCKET_FILENAME>"

```


## Gerenciamento de uma instância do package-executor

A ferramenta oferece uma série de comandos para gerenciar diversos aspectos da aplicação. Abaixo, você encontrará uma descrição detalhada de cada comando e exemplos de uso.

### Listar sockets
Lista todos os sockets de todas as instâncias em execução
```bash
supervisor sockets
```

### Mostrar status
 Mostra status de um instância em execução
```bash
supervisor status --socket [SOCKET_FILENAME]
```

### Listar tarefas
Lista todas as tarefas de um instância em execução
```bash
supervisor tasks --socket [SOCKET_FILENAME]
```

### Visualizar logs
Fica exibindo o logs de uma instância em execução
```bash
supervisor log --socket [SOCKET_FILENAME]
```

### Matar Execução
Mata a execução de uma instância.
```bash
supervisor kill --socket [SOCKET_FILENAME]
```

### Detalhar informações de tarefas
Mostra informações detalhada de uma tarefas específica
```bash
supervisor show task [TASK_ID] --socket "<SOCKET_FILENAME>"
```