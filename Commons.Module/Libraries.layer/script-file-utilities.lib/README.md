# script-file-utilities.lib

- **Tipo:** biblioteca (`.lib`) · **Namespace:** `@/script-file-utilities.lib`

Cria, recria e remove os **scripts executáveis** instalados em
`EcosystemData/executables/` (os comandos que ficam disponíveis no `PATH`).

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `CreateExecutableScript.js` | Cria um script executável genérico. |
| `CreatePackageExecutableScript.js` | Cria o script executável de um pacote. |
| `RecreateExecutableScript.js` | Recria um script executável existente. |
| `RemoveExecutableScript.js` | Remove um script executável. |
| `MakeFileExecutable.js` | Torna um arquivo executável (permissões). |
| `CreateUtf8TextFile.js` | Cria um arquivo de texto UTF-8. |
| `GetApplicationExecutionContent.js` | Gera o conteúdo de execução de uma aplicação (`.app`). |
| `GetCommandLineApplicationExecutionContent.js` | Gera o conteúdo de execução de uma CLI (`.cli`). |
| `GetDesktopApplicationExecutionContent.js` | Gera o conteúdo de execução de uma aplicação desktop (`.desktopapp`). |

> [README do repositório](../../../README.md)
