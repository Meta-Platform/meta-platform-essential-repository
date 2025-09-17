[Meta Platform Essential Repository](../../../README.md) / [Main Module](../../README.md)
# Repository Manager

O **Repository Manager** é uma ferramenta de linha de comando para gerenciamento centralizado de repositórios, permitindo configurar, instalar, atualizar e remover repositórios de diversas fontes.

## Estrutura de Comandos

### Comandos Principais

#### `sources`
**Descrição:** Mostra informações sobre as fontes disponíveis para instalação agregada pelo repositório

#### `list`
**Comandos disponíveis:**
- `list sources` - Lista as fontes disponíveis para instalação
- `list installed` - Exibe todos os repositórios que estão instalados e disponíveis para uso

#### `install [repositoryNamespace] [sourceType]`
**Descrição:** Instala um novo repositório no ecossistema

**Parâmetros:**
- `repositoryNamespace` (positional, string) - nome do repositório
- `sourceType` (positional, string) - tipo de fonte
- `--executables` (option, array) - nome dos executáveis a serem instalados

#### `update [repositoryNamespace]`
**Descrição:** Atualiza um repositório já instalado no ecossistema

**Parâmetros:**
- `repositoryNamespace` (positional, string) - nome do repositório

#### `show [repositoryNamespace]`
**Descrição:** Mostra informações detalhadas sobre um repositório específico instalado

**Parâmetros:**
- `repositoryNamespace` (positional, string) - nome do repositório

#### `register source [repositoryNamespace] [sourceType]`
**Descrição:** Adiciona uma nova fonte de repositório para ser instalado

**Parâmetros:**
- `repositoryNamespace` (positional, string) - nome do repositório
- `sourceType` (positional, string) - tipo de fonte
- `--localPath` (option, string) - Caminho do repositório local
- `--repoName` (option, string) - nome do repositório no github
- `--repoOwner` (option, string) - owner do repositório no github (geralmente o username)
- `--fileId` (option, string) - id do arquivo tar.gz com o repositório hospedado no google drive

#### `remove source [repositoryNamespace] [sourceType]`
**Descrição:** Remove uma fonte de repositório

**Parâmetros:**
- `repositoryNamespace` (positional, string) - nome do repositório
- `sourceType` (positional, string) - tipo de fonte

## Uso dos Comandos

### Gerenciamento de Fontes

```bash
# Mostrar informações das fontes
repo sources

# Listar fontes disponíveis
repo list sources

# Registrar nova fonte
repo register source MyRepo LOCAL_FS --localPath "~/my-repo"
repo register source MyRepo GITHUB_RELEASE --repoName "my-repo" --repoOwner "my-user"

# Remover fonte
repo remove source MyRepo LOCAL_FS
```

### Gerenciamento de Repositórios

```bash
# Listar repositórios instalados
repo list installed

# Instalar repositório
repo install MyRepo LOCAL_FS
repo install MyRepo GITHUB_RELEASE --executables "tool1" "tool2"

# Atualizar repositório
repo update MyRepo

# Mostrar detalhes do repositório
repo show MyRepo
```

## Tipos de Fonte Suportados

- **LOCAL_FS**: Sistema de arquivos local
- **GITHUB_RELEASE**: Repositórios do GitHub Releases
- **GOOGLE_DRIVE**: Arquivos do Google Drive

## Funcionalidades

- **Gerenciamento Completo**: Instalação, atualização e remoção de repositórios
- **Suporte a Múltiplas Fontes**: Diferentes tipos de fontes com parâmetros específicos
- **Atualizações Automatizadas**: Manutenção simplificada dos repositórios
- **Configuração Flexível**: Opções específicas para diferentes tipos de fontes
