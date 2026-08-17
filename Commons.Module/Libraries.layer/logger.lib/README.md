# logger.lib

- **Tipo:** biblioteca (`.lib`)
- **Namespace:** `@/logger.lib`
- **Localização:** `Commons.Module/Libraries.layer/logger.lib` (EssentialRepo)

## Propósito

Logger **único e canônico** da Meta Platform. Substitui os cinco mecanismos de
log que coexistiam no ecossistema — o `loggerEmitter` passado de função em
função, a `print-data-log.lib`, as cópias do formatador em `supervisor.lib`,
`pkg-exec`, `package-runner.cli` e `cli-script-loader`, e o `console.*` cru.

O logger é **instalado globalmente** (`globalThis.Log`) no bootstrap do
processo: nenhum módulo o recebe como parâmetro nem o carrega por `require`.
Grava histórico em disco em JSONL, com rotação e retenção, e imprime no
terminal no mesmo formato colorido que o ecossistema já usava.

**Log é observabilidade, não caminho crítico.** Nenhuma falha de I/O, disco
cheio ou permissão derruba o processo que logou.

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `InstallGlobalLogger.ts` | `InstallGlobalLogger(config)`: instala `globalThis.Log` (idempotente) com os sinks e o contexto do processo. Expõe também `Log.OpenFileChannel(...)`, `UninstallGlobalLogger` e `IsGlobalLoggerInstalled`. |
| `CreateLogger.ts` | Monta o logger sobre um conjunto de sinks e um contexto; expõe os sete níveis, `source()`, `child()`, `AddSink()`, `Flush()`, `FlushSync()` e `Close()`. |
| `Levels.ts` | Os sete níveis, sua ordem, os apelidos dos tipos antigos (`warning`, `success`) e o filtro dos dois pisos (`ResolveTargets`). |
| `CreateConsoleSink.ts` | Sink de terminal: formato colorido, `process.stdout.write` direto, sem cor quando não há TTY. |
| `CreateJsonlSink.ts` | Sink de arquivo: uma linha JSON por evento, escrita enfileirada e assíncrona, falha de I/O engolida. |
| `Rotation.ts` | Nome do arquivo do dia, corte por `LOG_CONF_MAX_FILE_SIZE_MB` e descarte por `LOG_CONF_RETENTION_DAYS`. |
| `InstallConsoleBridge.ts` | A ponte `console.* → Log`, com marca de idempotência e desinstalação. |
| `Serialize.ts` | Serialização defensiva de `data`: sobrevive a referência circular e preserva `message`/`stack` de um `Error`. |
| `Timestamp.ts` | Carimbo local `2026-07-27T10:12:03.412` e o `dateStamp` que nomeia o arquivo do dia. |
| `Colors.ts` | Acesso ao `colors` com degradação silenciosa: sem o módulo ou sem TTY, o sink escreve sem cor. |

## Os sete níveis

`trace → debug → info → message → warn → error → fatal`

| Nível | Quando usar |
|---|---|
| `trace` | Fluxo fino: entrada/saída de função, payload. |
| `debug` | Diagnóstico de desenvolvedor. |
| `info` | Operacional: start/stop, transição de task. |
| `message` | Saída destinada ao **humano** — sempre visível no terminal, e **sem carimbo**: é a fala do programa com quem o executou. |
| `warn` | Degradação recuperável. |
| `error` | Falha. |
| `fatal` | Falha que derruba o processo. |

## Uso

```ts
Log.info("UpdateRepository", "Atualizando...")
Log.error("CreateEnvironmentDir", "Falhou ao criar o diretório", { error })

const log = Log.source("UpdateRepository")   // source amarrado, uso local
log.info("Atualizando...")

const instanceLog = Log.child({ instanceId, packageName, environmentPath })
```

`Log.child` é o que permite ao *taskloader* carimbar o `instanceId` uma vez e
todo log daquela execução sair identificado, sem passar nada como parâmetro.

## Instalação no bootstrap

```ts
const InstallGlobalLogger = loggerLib.require("InstallGlobalLogger")

InstallGlobalLogger({
    origin: "repo",
    package: "repository-manager.cli",
    logsDirPath: "<EcosystemData>/logs/ecosystem",
    level: "info",
    consoleLevel: "message"
})
```

Idempotente: chamar duas vezes não encadeia a ponte `console.*` sobre ela mesma.

## Formatos

Terminal — os níveis de log levam carimbo:

```
[2026-07-27T10:12:03.412] [repo] [info   ] [UpdateRepository       ] Atualizando...
```

`message` sai LIMPO, porque é a saída que o usuário foi ver — carimbar a
listagem de um `repo sources` ou uma tabela renderizada destruiria justamente
aquilo. No arquivo, o registro é completo como todos os outros:

```
EssentialRepo
   LOCAL_FS
```

Arquivo (JSONL, uma linha por evento):

```json
{"ts":"2026-07-27T10:12:03.412","level":"info","source":"UpdateRepository","origin":"repo","pid":48213,"package":"repository-manager.cli","instanceId":null,"message":"Atualizando...","data":null}
```

## Configuração (`ecosystem-defaults.json`)

Herdada pelos pacotes pelo mecanismo de *startup params* — nenhum pacote copia
o valor.

| Variável | Padrão | O que controla |
|---|---|---|
| `LOG_CONF_DIRNAME_LOGS` | `logs` | Nome do diretório de logs. |
| `LOG_CONF_LEVEL` | `info` | Piso do que vai para o arquivo. |
| `LOG_CONF_CONSOLE_LEVEL` | `message` | Piso do que aparece no terminal. |
| `LOG_CONF_MAX_FILE_SIZE_MB` | `50` | Teto de tamanho antes de partir o arquivo. |
| `LOG_CONF_RETENTION_DAYS` | `30` | Prazo de descarte dos arquivos antigos. |

## Canal de arquivo

```ts
const canal = Log.OpenFileChannel({
    dirPath  : "<EcosystemData>/logs/instances",
    fileName : `${instanceId}.jsonl`,
    context  : { instanceId }
})

canal.info("Daemon", "instância lançada")
```

Um **canal** é um logger que escreve num arquivo próprio, à parte do log do
processo, e **não** escreve no terminal — o que ele registra pertence àquela
entidade, não à sessão de quem está olhando. É o que permite ao daemon manter
um arquivo por instância sem recriar escrita em disco por fora da lib.

## Ouvinte em tempo de execução

```ts
const Remover = Log.AddSink({ Write : (record) => { /* … */ } })
try { await Operacao() } finally { Remover() }
```

Para quem precisa **ouvir** o log sem ser um destino permanente — o caso
concreto é o NotificationHub, que mostra no painel o progresso de uma
instalação.

Atenção ao escopo: o logger é global, então um ouvinte registrado durante uma
operação recebe tudo o que o processo logar naquela janela, não apenas o
daquela operação. Registre pelo menor tempo possível e remova no `finally`.

## O que NÃO usa o `Log`

`Log` é para código que roda **dentro do ecossistema**. Continuam com `console`,
deliberadamente:

- ferramentas standalone (`scripts/`, `tools/`, `test.ts` avulso), que rodam por
  `node` fora do ecossistema — ali `globalThis.Log` não existe;
- os `SmartRequire`, carregados **durante** a construção do logger;
- o servidor MCP, cujo stdout é o canal do protocolo.

Isso não é dívida: é o certo. O lint anti-regressão
(`maintenance-toolkit.cli/scripts/lint-no-console-log.js`) conhece essas
exceções e falha em qualquer outra.

## Três regras invioláveis dos sinks

1. **Nunca derrubar o processo.** Falha de I/O, disco cheio ou permissão são
   engolidos.
2. **Nunca usar `console`.** Os sinks escrevem com `process.stdout.write` — do
   contrário a ponte `console.* → Log` se realimenta e vira recursão infinita.
3. **Nunca bloquear quem chamou.** A escrita em arquivo é enfileirada e
   assíncrona.

## Ponte `console.*`

| `console` | nível | source |
|---|---|---|
| `console.log` | `message` | `<stdout>` |
| `console.info` | `info` | `<stdout>` |
| `console.debug` | `debug` | `<stdout>` |
| `console.warn` | `warn` | `<stderr>` |
| `console.error` | `error` | `<stderr>` |

A ponte é **permanente**: captura o que vem de dependência npm e do Electron,
que não têm como chamar o `Log`.

## Dependências

`colors` (via `smart-require.lib`, respeitando `EXTERNAL_NODE_MODULES_PATH`).

> [README do repositório](../../../README.md)
