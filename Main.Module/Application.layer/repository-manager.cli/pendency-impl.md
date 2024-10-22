
## Comandos

### Gerenciamento de Fontes

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
repo uninstall EssentialRepo
```
