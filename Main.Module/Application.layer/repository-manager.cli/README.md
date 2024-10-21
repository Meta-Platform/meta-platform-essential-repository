[Meta Platform Essential Repository](../../../README.md) / [Main Module](../../README.md)
# Repository Manager
O **Repository Manager Command-Line** é responsável pelo gerenciamento e configuração de repositórios, atuando como um configurador centralizado. Ele permite:

- **Listar Repositórios Registrados**: Exibe uma lista de todos os repositórios disponíveis, incluindo suas fontes, que podem ser locais ou remotas.
- **Registrar Novas Fontes de Repositório**: Permite adicionar novas fontes de repositório e especificar seus tipos.
- **Instalar Repositórios**: Instala repositórios selecionados.
- **Atualizar Repositórios**: Atualiza repositórios instalados para as versões mais recentes.
- **Listar Repositórios Instalados**: Exibe uma lista dos repositórios que já estão instalados e registrados para uso.
- **Desinstalar Repositórios**: Remove repositórios do ecossistema.
- **Exibir Detalhes de um Repositório**: Mostra informações detalhadas sobre um repositório específico.
- **Configurar Repositórios**: Permite ajustar opções específicas de um repositório instalado.
- **Gerenciar Fontes**: Possibilidade de adicionar, remover e listar fontes de repositórios.


## Funcionalidades

- **Gerenciamento Completo de Repositórios**: Controle total sobre a instalação, atualização e remoção de repositórios.
- **Suporte a Múltiplas Fontes**: Capacidade de registrar e gerenciar repositórios de diferentes fontes e tipos.
- **Atualizações Automatizadas**: Possibilidade de atualizar todos os repositórios instalados simultaneamente.

## Comandos

### Gerenciamento de Fontes

#### Mostrar Informações sobre Fontes

Exibe todas as informações sobre as fontes de repositórios disponíveis para instalação.

```bash
repo show sources info
```

#### Listar Fontes

Lista todas as fontes registradas.

```bash
repo list sources
```

#### Adicionar uma Nova Fonte de Dados

Permite adicionar uma nova fonte de repositório especificando seu tipo.

```bash
# PEDENDENTE
repo add source [sourceType]
# Um formulário será aberto para completar o registro da nova fonte.
```

**Exemplo:**

```bash
repo add source GIT_REPO
```

#### Remover Fonte

Permite remover uma fonte de repositório registrada.

```bash
# PEDENDENTE
repo remove source [sourceType]
```

**Exemplo:**

```bash
repo remove source LOCAL_FS
```

#### Atualizar Todas as Fontes

Atualiza a lista de repositórios disponíveis consultando todas as fontes registradas.

```bash
# PEDENDENTE
repo update sources
```

### Gerenciamento de Repositórios

#### Listar Repositórios Instalados

Exibe todos os repositórios que estão instalados e disponíveis para uso.

```bash
repo list installed
```

#### Exibir Detalhes de um Repositório

Mostra informações detalhadas sobre um repositório específico.

```bash
# PEDENDENTE
repo show [repositoryNamespace]
```

**Exemplo:**

```bash
repo show EcosystemCore
```

#### Instalar um Repositório

Instala um repositório especificado a partir de uma fonte.

```bash
# PEDENDENTE
repo install [repositoryNamespace] [sourceType]
```

**Exemplo:**

```bash
repo install EcosystemCore LOCAL_FS
```

#### Atualizar um Repositório Instalado

Atualiza um repositório instalado para a versão mais recente disponível na fonte especificada.

```bash
# PEDENDENTE
repo update [repositoryNamespace] [sourceType]
```

**Exemplo:**

```bash
repo update EssentialRepo LOCAL_FS
```

#### Atualizar Todos os Repositórios Instalados

Atualiza todos os repositórios instalados para suas versões mais recentes.

```bash
# PEDENDENTE
repo update all
```

#### Desinstalar um Repositório

Remove um repositório instalado do ecossistema.

```bash
# PEDENDENTE
repo uninstall [repositoryNamespace]
```

**Exemplo:**

```bash
repo uninstall EcosystemCore
```

## Exemplos de Uso

- **Instalar um Repositório do GitHub**

  ```bash
  repo add source GIT_REPO
  repo install MyRepo GIT_REPO
  ```

- **Atualizar Todos os Repositórios Instalados**

  ```bash
  repo update all
  ```

- **Remover uma Fonte de Repositório**

  ```bash
  repo remove source GIT_REPO
  ```
