# Cópias do `ecosystem-defaults.json` — CFGEC-31

## Situação

O arquivo `ecosystem-defaults.json` existe hoje em **4 cópias** byte-idênticas,
espalhadas pelo monorepo:

| # | Papel | Caminho |
|---|-------|---------|
| 1 | **CANÔNICA** | `repos/essential-repository/Main.Module/Application.layer/repository-manager.cli/src/Configs/ecosystem-defaults.json` |
| 2 | Cópia (consumidor) | `repos/essential-repository/Main.Module/Application.layer/maintenance-toolkit.cli/src/Configs/ecosystem-defaults.json` |
| 3 | Spec pública (derivada) | `Meta-Platform/meta-platform-open-standard/specifications/metadados/ecosystem-defaults.json` |
| 4 | Cópia (consumidor) | `Meta-Platform/meta-platform-setup-wizard-command-line/configs/ecosystem-defaults.json` |

Verificação em 2026-07-11 — todas as 4 com o mesmo `sha256`:
`8e5736b675788cd4d39578f7f6462d5b00c9aa01668f18aa23575f1315c60db4`.

## Qual é a canônica

A cópia do **`repository-manager.cli`** (#1) é a fonte da verdade: é ela que o
fluxo de `install` materializa no ecossistema do usuário. As demais são cópias
que **devem** permanecer idênticas a ela.

## Quem deveria copiar de quem

- `maintenance-toolkit.cli` (#2) → deriva de #1.
- `meta-platform-setup-wizard-command-line` (#4) → deriva de #1.
- `meta-platform-open-standard` (#3, spec pública) → é **derivada** de #1: a
  spec documenta o mesmo conteúdo que o `install` entrega. Não editar #3 à mão;
  ela reflete a canônica.

## Verificação automática (este check)

`scripts/verify-ecosystem-defaults-copies.js` compara cada cópia contra a
canônica por **bytes (sha256)** e por **JSON normalizado** (chaves ordenadas
recursivamente, para pegar divergência semântica mesmo com formatação
diferente). Sai com código `!= 0` se qualquer cópia divergir.

```
node scripts/verify-ecosystem-defaults-copies.js
```

Sem dependências npm novas (só `node:fs`/`node:crypto`/`node:path`). Pensado
para ser plugado no lint/CI do **CFGEC-29**.

## Recomendação de longo prazo (NÃO implementada aqui)

Esta tarefa (CFGEC-31) adota a solução de **menor risco**: manter as 4 cópias e
garantir igualdade via check automático. A eliminação da duplicação é trabalho
futuro. Direção sugerida quando for atacada:

1. Eleger #1 como única fonte física do arquivo.
2. `maintenance-toolkit.cli` e `setup-wizard` **importarem/gerarem** o
   `ecosystem-defaults.json` a partir da canônica (build step ou require),
   em vez de manter cópia versionada.
3. A **spec pública** (#3) passa a ser um artefato **derivado** da canônica
   (gerado por script na publicação do open-standard), permanecendo sob este
   mesmo check enquanto coexistir como arquivo físico.

Até lá, este check é a rede de segurança contra drift entre as cópias.
