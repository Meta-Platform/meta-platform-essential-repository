# script-file-utilities.lib

- **Tipo:** biblioteca (`.lib`)
- **Namespace:** `@/script-file-utilities.lib`
- **Localização:** `Commons.Module/Libraries.layer/script-file-utilities.lib` (EssentialRepo)

## Propósito

Cria, recria e remove os **scripts executáveis** instalados em
`EcosystemData/executables/` (os comandos que ficam disponíveis no `PATH`).

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `CreateExecutableScript.ts` | Cria um script executável genérico. |
| `CreatePackageExecutableScript.ts` | Cria o script executável de um pacote. |
| `RecreateExecutableScript.ts` | Recria um script executável existente. |
| `RemoveExecutableScript.ts` | Remove um script executável. |
| `MakeFileExecutable.ts` | Torna um arquivo executável (permissões). |
| `CreateUtf8TextFile.ts` | Cria um arquivo de texto UTF-8. |
| `GetApplicationExecutionContent.ts` | Gera o conteúdo de execução de uma aplicação (`.app`). |
| `GetCommandLineApplicationExecutionContent.ts` | Gera o conteúdo de execução de uma CLI (`.cli`). |
| `GetDesktopApplicationExecutionContent.ts` | Gera o conteúdo de execução de uma aplicação desktop (`.desktopapp`). |

> [README do repositório](../../../README.md)
