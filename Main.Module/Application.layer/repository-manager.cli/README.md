[Meta Platform Essential Repository](../../../README.md) / [Main Module](../../README.md)
# Repository Manager

O **Repository Manager Command-Line** é responsável por todo o gerenciamento e configuração de repositórios, funcionando como um configurador de repositórios. Ele permite:

- **Listar Repositórios registrados**: Exibe uma lista de todos os repositórios disponíveis, incluindo suas fontes, que podem ser local ou remota.
- **Registrar Fontes de Novos Repositório**: Permite adicionar novas fontes de repositório e especificar seus tipos.
- **Instalar Repositórios**: Instala repositórios selecionados e lista aqueles que já estão instalados.
- **Listar Repositórios Instalados**: Instala repositórios disponiveis que estão registado para uso
- **Desinstala um Repositórios**: Desistala um repositórios do ecosistema.

## Funcionalidades

- **Gerenciamento Completo de Repositórios**: Controle total sobre a instalação, atualização e remoção de repositórios.
- **Suporte a Múltiplas Fontes**: Capacidade de registrar e gerenciar repositórios de diferentes fontes e tipos.

## Comandos

### Mostra informações sobre fontes
Exibe todas as informações sobre todas as fontes de repositórios disponiveis para instalação

```bash
repo show sources info
```

### Lista fontes
Lista todas as fontes disponíveis para instalação

```bash
repo list sources
```

### Adicionar um nova fonte de dados
```bash
repo add source [sourceType]
# aqui deverá abrir um formulário para completar o registro da nova fonte de um repositório
```


### Instalar um repositório
```bash
repo install [repositoryNamespace] [sourceType]
```
```bash
repo install EcosystemCore LOCAL_FS
```
### Atualizar um repositório instaldo
```bash
repo update [repositoryNamespace] [sourceType]
```
```bash
repo update EcosystemCore LOCAL_FS
```