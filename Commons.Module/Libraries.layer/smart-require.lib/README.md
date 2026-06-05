# smart-require.lib

- **Tipo:** biblioteca (`.lib`) · **Namespace:** `@/smart-require.lib`

`require` resiliente que resolve módulos a partir do diretório de dependências
externas (`EXTERNAL_NODE_MODULES_PATH`), com *fallback* para `node_modules`.

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `SmartRequire.js` | Carrega um módulo pelo nome a partir do diretório de dependências configurado. |

> A melhoria desse mecanismo é um item de planejamento interno.
> [README do repositório](../../../README.md)
