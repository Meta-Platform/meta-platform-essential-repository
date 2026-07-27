# resource-params-handler.lib

- **Tipo:** biblioteca (`.lib`)
- **Namespace:** `@/resource-params-handler.lib`
- **Localização:** `Runtime.Module/MetadataHelpers.layer/resource-params-handler.lib` (EssentialRepo)

## Propósito

Traduzir os **recursos declarados** de um package — `metadata/socket-params.json`
e `metadata/storage-params.json` — nos caminhos reais em disco, materializar as
pastas e injetar os valores resolvidos nos `startup-params` da hierarquia de
metadados.

É o que permite um package dizer *"eu tenho um socket chamado assim e um banco
chamado assado"* em vez de carregar `/home/alguem/EcosystemData/sockets/...`
escrito à mão no metadata versionado.

### O problema que resolve

Antes, cada aplicação repetia o caminho absoluto no `startup-params.json` — o do
`ecosystem-instance-manager.app` aparecia copiado em mais três packages. Um
caminho copiado é um contrato implícito: ninguém sabe quem é o dono do recurso,
mudar a convenção exige caçar cópias, e o metadata versionado carrega o
`$HOME` de quem o escreveu.

Aqui o recurso passa a ser **lógico**: quem declara diz o nome, e o ecossistema
decide onde isso mora. O formato veio do VirtualDesk, onde a mesma regra já
valia — o usuário manipula recurso lógico, nunca caminho físico.

### Por que no EssentialRepo

Porque o ponto por onde **todo** package sobe é o `pkg-exec`, e ele carrega suas
libs de runtime daqui. Uma resolução que vivesse só no lançador do daemon
deixaria de fora justamente os executáveis globais — inclusive o do próprio
daemon.

## Exports (`src/`)

| Módulo | Responsabilidade |
|---|---|
| `NormalizeResourceParam.js` | Uniformiza as duas formas de declaração (string curta e objeto). |
| `ResolvePackageResourceParams.js` | Traduz as declarações de um package em caminhos reais. Puro: não toca no disco. |
| `EnsureResources.js` | Cria as pastas dos recursos de que o package é dono. |
| `ApplyResourceParamsToHierarchy.js` | Sobrepõe os caminhos resolvidos no `startup-params` de cada nó e devolve o inventário. |

## Formato dos metadados

`metadata/socket-params.json` — a forma curta cobre o caso comum (o package é
dono do socket):

```json
{
    "socket": "ecosystem-instance-manager.app.sock"
}
```

`metadata/storage-params.json` — nome com extensão é arquivo, sem extensão é
pasta:

```json
{
    "instanceStoreFilePath": "ecosystem-instance-store.sqlite",
    "workDirPath": "work"
}
```

A forma objeto existe para os casos que a curta não expressa:

| Campo | Efeito |
|---|---|
| `namespace` | Agrupa o recurso. No storage é a pasta; ausente, deriva do nome do package. |
| `filename` | Nome dentro do namespace. Ausente no storage, o recurso **é** a pasta do namespace. |
| `owner` | `false` = apenas referencia o recurso de outro package. Nada é criado. |
| `scope` | Só socket: `"supervisor"` resolve em `supervisor-sockets/` em vez de `sockets/`. |
| `type` | Só storage: `"file"` ou `"directory"`, quando a heurística de extensão não serve. |

Referenciar o socket de outro package é o que substitui o caminho copiado:

```json
{
    "instanceManagerSocketPath": { "namespace": "ecosystem-instance-manager.app", "owner": false },
    "supervisorSocketPath": { "filename": "instance-manager.sock", "scope": "supervisor" }
}
```

## Onde cada coisa vai parar

| Recurso | Caminho resolvido |
|---|---|
| socket | `<EcosystemData>/<ECOSYSTEMDATA_CONF_DIRNAME_UNIX_SOCKET_DIR>/<filename>` |
| socket com `scope: "supervisor"` | `<EcosystemData>/<ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR>/<filename>` |
| storage | `<EcosystemData>/<ECOSYSTEMDATA_CONF_DIRNAME_STORAGE_DIR>/<namespace>/<filename>` |

Os sockets ficam numa pasta **plana** de propósito: é onde os clientes já
conectam hoje, e mudar o layout quebraria conexão em uso. O storage é agrupado
por namespace porque é ele que dá ao dado um dono visível — é essa pasta que um
gerenciador de storage navega.

## Dono e referência

Só o **dono** materializa. Quem apenas referencia recebe o mesmo caminho
resolvido e não cria nada: um cliente deve falhar ao conectar num servidor que
não subiu, e não fazer nascer um diretório vazio que parece instalação.

Arquivo declarado nunca é criado — só a pasta que o contém. Um SQLite vazio
criado por fora não é um SQLite; quem abre é quem cria.

### Recurso compartilhado entre packages

Quando vários packages usam o **mesmo** arquivo (o banco de workspaces do Package
Developer é usado por quatro), todos declaram o mesmo `namespace` + `filename` e
todos como donos. Criar diretório é idempotente, então quem subir primeiro
garante a pasta — marcar todos como referência deixaria o recurso sem ninguém
para materializá-lo.

## Por que a aplicação roda depois do `BuildMetadataHierarchy`

O merge por-nó da hierarquia é `{ ...injetado pelo ecossistema, ...próprio do
package }`: o `startup-params.json` sobrepõe a base. Se o recurso entrasse como
base, um `"socket"` literal esquecido no metadata continuaria mandando — o
caminho absoluto que este mecanismo existe para eliminar. Aplicando **depois**,
o recurso declarado vence, e o literal fica valendo só para quem ainda não
declarou.

O valor resolvido chega aos packages referenciados pelo caminho de sempre: o
`{{param}}` do `boot.json`, que lê os `startup-params` do nó raiz.

## API

```js
const ApplyResourceParamsToHierarchy = resourceParamsHandlerLib.require("ApplyResourceParamsToHierarchy")
const EnsureResources                = resourceParamsHandlerLib.require("EnsureResources")

const { metadataHierarchy, resources } = ApplyResourceParamsToHierarchy({
    metadataHierarchy,
    installDataDirPath: ECO_DIRPATH_INSTALL_DATA,
    ECOSYSTEMDATA_CONF_DIRNAME_UNIX_SOCKET_DIR,
    ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR,
    ECOSYSTEMDATA_CONF_DIRNAME_STORAGE_DIR
})

EnsureResources(resources)   // cria as pastas antes da execução começar
```

`resources` é o inventário do que está mapeado — `{ kind, parameter, namespace,
filename, owner, scope, type, path, dirPath, packagePath }` por recurso. É o dado
que um gerenciador de storage exibe.

> Veja o [README do repositório](../../../README.md).
