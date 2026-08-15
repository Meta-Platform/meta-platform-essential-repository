# module-resolution.lib

- **Tipo:** biblioteca (`.lib`)
- **Namespace:** `@/module-resolution.lib`
- **Localização:** `Commons.Module/Libraries.layer/module-resolution.lib` (EssentialRepo)

## Propósito

Ensina o processo a resolver módulos **TypeScript** em `require` sem extensão.

O Node ≥ 22.18 executa um `.ts` apagando os tipos, mas só o encontra quando a
extensão é escrita por inteiro. A plataforma requer sem extensão — e os
metadados (`entry`, `path` de comando) também referenciam sem extensão. Esta lib
é a ponte: acrescenta os candidatos `.ts` **depois** que a resolução nativa
falha, o que preserva a precedência do JavaScript e mantém os dois dialetos
convivendo no mesmo package.

Implementação de referência do
[Source Language Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/source-language-standard.md).

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `InstallTypeScriptResolution.js` | Instala o hook de resolução no processo (idempotente). |
| `ResolveTypeScriptPath.js` | Traduz um specifier no arquivo `.ts` correspondente, se existir. |
| `ResolveModulePath.js` | Encontra o arquivo de um módulo pelo caminho sem extensão, em qualquer dialeto. |
| `AssertTypeScriptRuntime.js` | Recusa runtime abaixo de Node 22.18, com mensagem explícita. |
| `register.js` | Instala ao ser carregado — para uso com `node --require`. |

### `ResolveModulePath` e a checagem que passa a mentir

Código que verifica a presença de um módulo escrevendo `existsSync(caminho +
".js")` continua compilando, continua rodando — e passa a responder "não existe"
no dia em que aquele módulo vira `.ts`. O arquivo está lá, o recurso some, e não
há erro nenhum para investigar.

`ResolveModulePath` é o substituto dessa checagem: pergunta pelo **módulo**, não
pelo arquivo `.js`.

## Uso

No **ponto de entrada do processo**, antes de carregar qualquer package:

```js
require(".../module-resolution.lib/src/InstallTypeScriptResolution")()
```

Nos testes, pela flag do runner:

```
node --require .../module-resolution.lib/src/register.js --test
```

> `node --test <diretório>` é incompatível com `--require`: o diretório passa a
> ser resolvido como módulo. Use o padrão sem argumento ou um glob.

## Por que é JavaScript

Todo arquivo desta lib é **permanentemente** JavaScript, e não uma conversão
pendente: é ela que ensina o Node a carregar `.ts`. Escrita em TypeScript, não
haveria quem a carregasse.

[README do repositório](../../../README.md)
