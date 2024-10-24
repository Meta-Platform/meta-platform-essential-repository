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
repo sources info
```

#### Listar Fontes

Lista todas as fontes registradas.

```bash
repo list sources
```

### Gerenciamento de Repositórios

#### Listar Repositórios Instalados

Exibe todos os repositórios que estão instalados e disponíveis para uso.

```bash
repo list installed
```

#### Exibir Detalhes de um Repositório instalado

Mostra informações detalhadas sobre um repositório específico instalado.

```bash
repo show [repositoryNamespace]
```

**Exemplo:**

```bash
repo show EssentialRepo
```

#### Instalar um Repositório

Instala um repositório especificado a partir de uma fonte.

```bash
repo install [repositoryNamespace] [sourceType]
```

**Exemplo:**

```bash
repo install EcosystemCoreRepo LOCAL_FS
```

#### Atualizar um Repositório Instalado

Atualiza um repositório instalado para a versão mais recente disponível na fonte especificada.

```bash
repo update [repositoryNamespace] [sourceType]
```

**Exemplo:**

```bash
repo update EssentialRepo LOCAL_FS
```