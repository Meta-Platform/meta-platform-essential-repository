[Meta Platform Essential Repository](../../../README.md) / [Runtime Module](../../README.md)
# Dependency Graph Builder Library

Esse pacote é responsável por construir uma **hierarquia de metadados** de um pacote e suas dependências. A função mais importante é a `BuildMetadataHierarchy`.

## Construção de uma Hierarquia de Metadados

### `BuildMetadataHierarchy(params)`

Resolve, a partir de um pacote raiz, o grafo de metadados de todas as suas dependências (por namespace) e retorna a hierarquia montada.

**Parâmetros** (objeto único):
  - `startupParams` (object): Parâmetros de inicialização aplicados aos itens da hierarquia (substituídos em `dependencyList`).
  - `path` (string): Caminho base do repositório/pacote onde a resolução começa.
  - `packageList` (array): Lista de pacotes a resolver na construção do grafo.
  - `REPOS_CONF_EXT_GROUP_DIR` (string): Sufixo que identifica um diretório de *group* (padrão `"group"`).
  - `PKG_CONF_DIRNAME_METADATA` (string): Nome do diretório de metadados de cada pacote (padrão `"metadata"`).

**Retorno**: objeto `{ dependencyList, linkedGraph }` — a lista de dependências (com `startupParams` aplicados) e o grafo vinculado.

## O que é uma hierarquia de metadados (`metadata hierarchy`)?

É a árvore que representa o pacote raiz somado a todas as suas dependências resolvidas por namespace — a estrutura que o Package Executor consome para montar o plano de execução (ver [Dependency Resolution Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/dependency-resolution-standard.md)).
