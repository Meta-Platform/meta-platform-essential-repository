# native-service.taskLoader

- **Tipo:** *task loader* (`.taskLoader`)
- **Namespace:** `@/native-service.taskLoader`
- **Localização:** `Taskloaders.Module/Loaders.layer/native-service.taskLoader` (EssentialRepo)

## Propósito

*Object loader* do tipo **`native-service`**: carrega um pacote
`.nativeservice` — um **serviço-folha de I/O** implementado como código nativo
compilado — e entrega ao consumidor um handle que o descreve.

O tipo existe para a fração de serviços que o
[ADR-0002](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/decisions/ADR-0002-runtimes-de-execucao-alem-do-node.md)
identifica como não podendo ser WebAssembly por **capacidade**, não por
preferência: quem precisa abrir um socket de domínio Unix, chamar `epoll` ou
falar com o `docker.sock` não alcança isso de dentro de `wasi:sockets`, que
cobre TCP/UDP e não tem socket Unix. O ganho medido é de ordem de grandeza — um
serviço-folha em Node parte de 104–211 MiB de RSS; o mesmo papel em nativo, de
~2 MiB.

## O que este loader NÃO faz, e por quê

Ele **não carrega o `cdylib`** e **não sobe processo nenhum**.

Carregar o binário dentro do processo Node transformaria um `.nativeservice` num
`.nativelib` — a amarração a N-API que o ADR-0002 recusa no item 5, e que obriga
a recompilar o artefato a cada versão do runtime hospedeiro. Quem carrega o
artefato é o **host nativo genérico**, noutro processo, que implementa o
[Package Executor RPC Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/package-executor-rpc-standard.md).

E a ligação entre uma task de plano de execução e esse host **ainda não é
norma**: o
[Native Service Manifest Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/packages/nativeservice-manifest-standard.md)
declara fora de escopo como uma `.nativeservice` é descoberta, iniciada e
encadeada num plano. Enquanto essa norma não existe, a task ativa entrega a
descrição validada do serviço e para aí — subir processo seria decidir no código
uma norma que ninguém escreveu.

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `NativeService.taskLoader.ts` | Ciclo de vida da task: lê o manifesto, resolve o artefato e publica o handle. |
| `ReadNativeServiceManifest.ts` | Lê e valida `metadata/nativeservice.json`. |
| `ResolveBinaryForPlatform.ts` | Escolhe, na matriz declarada, o artefato desta máquina. |
| `CreateNativeServiceHandle.ts` | Monta o handle congelado entregue ao consumidor. |

## O manifesto do pacote (`metadata/nativeservice.json`)

| Campo | Obrigatório | Descrição |
|---|---|---|
| `alias` | sim | Nome pelo qual o serviço é referenciado. |
| `abiVersion` | sim | Inteiro `>= 1`. Incrementa a cada mudança incompatível de assinatura ou de contrato de `symbols`. |
| `binary` | sim | Mapa `plataforma-arquitetura` → caminho **relativo** do artefato (ex.: `"linux-x64": "dist/linux-x64/proxy.so"`). |
| `symbols` | sim | Símbolos exportados pelo binário. Precisa conter os quatro obrigatórios. |
| `capabilities` | sim | `[{ name, reason }]` — o que o serviço acessa direto do SO, e por quê. |

### Os quatro símbolos obrigatórios

| Símbolo | Papel |
|---|---|
| `nativeservice_abi_version` | Devolve o `abiVersion` embutido no binário. O host o chama **antes** de qualquer outro, para recusar um artefato de outra geração sem executar meia inicialização. |
| `nativeservice_init` | Recebe os parâmetros de partida e inicializa o serviço. |
| `nativeservice_handle` | Ponto de entrada de I/O. A **forma** depende do que o serviço faz; a norma não a fixa — fixa que o símbolo exista. |
| `nativeservice_shutdown` | Encerramento ordenado, chamado antes de `KillInstance`. |

### `capabilities` é auditoria, não sandbox

Diferente do `wasi.preopens` de uma `.wasmlib` — que a sandbox WASI **aplica** —,
`capabilities` aqui não é imposta por nada: código nativo não tem isolamento de
memória, e o processo pode acessar o que não declarou. O campo é o registro
explícito de **por que este serviço precisa ser `.nativeservice` e não
`.wasmlib`**, que é o critério que o ADR-0002 exige antes de aceitar a exceção
nativa. Por isso `reason` é obrigatória: uma capacidade sem razão não serve ao
único fim que o campo tem.

## O handle entregue ao consumidor

| Método | Devolve |
|---|---|
| `getAlias()` | O alias declarado no manifesto. |
| `getManifest()` | Cópia do manifesto já validado. |
| `getRootPath()` | Raiz do pacote. |
| `getAbiVersion()` | A versão da ABI C que o artefato fala. |
| `getPlatformKey()` | A combinação `plataforma-arquitetura` desta máquina. |
| `getBinaryPath()` | Caminho absoluto do artefato escolhido — é o que atravessa a fronteira de processo até o host. |
| `getBinaryMatrix()` | A matriz inteira, para quem precisa saber onde o serviço roda sem estar rodando lá. |
| `getSymbols()` | Os símbolos declarados. |
| `getCapabilities()` | As capacidades declaradas, com a razão de cada uma. |

## Duas falhas diferentes, de propósito

Faltar a combinação **desta** máquina não é erro de manifesto: o manifesto pode
estar impecável e o pacote simplesmente não ter sido compilado para cá. Por isso
as mensagens são distintas —

- `` `binary.linux-x64` aponta para um arquivo que não existe `` — o pacote foi
  publicado incompleto (erro de quem publicou);
- `Binário não encontrado para a plataforma linux-x64: o serviço @x declara
  linux-arm64` — o pacote é válido e não cobre esta máquina (erro de quem
  escolheu onde ativar).

## Registro (`metadata/taskloaders.json` do repositório)

| Campo | Valor |
|---|---|
| `objectLoaderType` | `native-service` |
| `entry` | `src/NativeService.taskLoader` |
| `npmDependencies` | — |

## Testes

```bash
npm test
```

As fixtures de `tests/fixtures` são pacotes de mentira: artefatos vazios (o
loader nunca os abre — quem faz `dlopen` é o host) e um manifesto quebrado por
campo obrigatório. Cada teste verifica que a falha chega ao status da task **com
motivo**, porque sem o motivo todas apareceriam como `FAILURE` sem dizer qual
dos campos estava errado.

> Host nativo de referência:
> [`native-service-host`](https://github.com/Meta-Platform/meta-platform-open-standard/tree/main/reference-implementations/native-service-host).
> Para criar o seu próprio loader, veja o
> [Guia: como criar e usar um Object Loader](../../../Runtime.Module/Executor.layer/task-executor.lib/docs/guia-criar-object-loader.md).
> [README do repositório](../../../README.md)
