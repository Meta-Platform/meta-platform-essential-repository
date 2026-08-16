# resolve-package-name.lib

- **Tipo:** biblioteca (`.lib`)
- **Namespace:** `@/resolve-package-name.lib`
- **Localização:** `Runtime.Module/MetadataHelpers.layer/resolve-package-name.lib` (EssentialRepo)

## Propósito

Resolve o **nome/namespace de um pacote** a partir de suas referências. É usado em
runtime pelos task loaders `nodejs-package` e `install-nodejs-package-dependencies`
(não na montagem da hierarquia de metadados / plano de execução).

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `ResolvePackageName.ts` | Resolve o nome do pacote a partir de uma referência. |

> Convenções de namespace: ver [Package](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/concepts/package.md).
> [README do repositório](../../../README.md)
