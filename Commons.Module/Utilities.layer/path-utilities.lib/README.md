# path-utilities.lib

- **Tipo:** biblioteca (`.lib`)
- **Namespace:** `@/path-utilities.lib`
- **Localização:** `Commons.Module/Utilities.layer/path-utilities.lib` (EssentialRepo)

## Propósito

Cálculos de caminho que a plataforma inteira faz do mesmo jeito — e que, por
isso, não podem ter duas versões.

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `ConvertPathToAbsolutPath.ts` | Resolve o `~` dos caminhos escritos em metadados e perfis. |

## Por que existe

O `~` é escrito por gente, nos perfis de instalação e nos metadados; o sistema
de arquivos não o conhece. A tradução vivia em **cinco cópias** pelo repositório
— duas delas escritas à mão dentro de outros módulos. Cópias de um cálculo de
caminho não divergem com barulho: divergem em silêncio, e o ecossistema aparece
instalado no lugar errado.

[README do repositório](../../../README.md)
