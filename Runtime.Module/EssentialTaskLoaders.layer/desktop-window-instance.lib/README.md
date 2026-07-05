# desktop-window-instance.lib

- **Tipo:** biblioteca / *task loader* (`.lib`) · **Namespace:** `@/desktop-window-instance.lib`

*Object loader* do tipo **`desktop-window-instance`**: abre uma janela
[Electron](https://www.electronjs.org/) durante a execução de um plano pelo *task
executor*. Suporta três modos:

- **`loadURL`** (`url`): a janela aponta para uma aplicação web **local** (ex.: o
  webapp que sobe junto, no mesmo `.desktopapp`, via `services`/`endpoints`). A
  janela espera o `@@/server-service` ficar `ACTIVE` (via `agentLinkRules`) e
  reintenta o `loadURL` enquanto a interface ainda está compilando.
- **`loadFile`** (`file`, opcionalmente com `dependency`): carrega um HTML
  **local** do package indicado, para conteúdo estático autossuficiente.
- **`gui-host`** (`gui-host`): a janela **não** carrega uma URL HTTP — este
  processo Electron **compila o webgui e hospeda os services por IPC**,
  dispensando o servidor HTTP/webservices no caminho desktop. Ver
  [Modo GUI-host](#modo-gui-host) abaixo.

É o loader que dá suporte aos packages do tipo
[`.desktopapp`](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/concepts/package.md):
cada entrada da seção `windows` do `boot.json` vira uma task
`desktop-window-instance`.

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `DesktopWindowInstance.taskLoader.js` | Carrega/instancia o `desktop-window-instance`; mantém a task `ACTIVE` enquanto a janela estiver aberta. No modo `gui-host`, monta o config (caminhos dos handles + params) num JSON temporário e o passa ao Electron via `DESKTOP_GUI_CONFIG_PATH`. |
| `OpenElectronWindow.js` | Faz `spawn` do binário do Electron apontando para `electron-main.js` (env: `DESKTOP_WINDOW_URL`/`_FILE` ou `DESKTOP_GUI_CONFIG_PATH`). |
| `electron-main.js` | Processo *main* do Electron. Modo `loadURL`: tela de carregamento + *polling* HTTP até o servidor local responder. Modo `loadFile`: HTML local. Modo `gui-host`: compila o webgui (progresso na tela de carregamento), instancia o grafo de services e os expõe por IPC + protocolo de ícones, e faz `loadFile` do bundle. |
| `loading.html` | Tela provisória (estilo *retro-brutalist*, auto-contida) exibida enquanto o webgui compila; barra de progresso alimentada por `window.buildProgress` (modo `gui-host`). |
| `preload.js` | Expõe ao renderer: `electronNotifications`, `buildProgress` (progresso do build) e `metaGui` (ponte IPC — `invoke(serviceName, method, data)` / `getManifest()`). |

## Modo GUI-host

Nas aplicações Electron o webgui e os services rodariam na mesma máquina, então o
servidor HTTP + webservices é uma camada desnecessária. No modo **GUI-host** o
**processo principal do Electron hospeda os services** e os expõe ao renderer por
**IPC** (`window.metaGui`), sem HTTP. Como a janela Electron é um **processo
separado** do host (só strings cruzam o `spawn`), o host serializa os caminhos +
params num JSON temporário; o Electron reconstrói o grafo de services no próprio
processo.

Benefícios: sem porta HTTP/webservice no caminho desktop; melhor desacoplamento;
e, como o Electron passa a compilar o webgui, ele conhece a **porcentagem real do
build** e a empurra para a tela de carregamento. Mantém **dual-transport**: o
mesmo webgui roda standalone no navegador (HTTP) quando `window.metaGui` não
existe.

### Anatomia (o spec `gui-host` no `boot.json`)

A janela declara, no lugar de `url`/`file`:

```jsonc
{
  "title": "…", "width": 1280, "height": 800,
  "dependency": "@/<app>.webgui",          // conteúdo + inclui o webgui no grafo
  "params": { "serverName": "…", "RT_ENV_GENERATED_DIR_NAME": "…", /* escalares */ },
  "bound-params": {                          // handles de pacote (webgui + services + libs)
    "<appWebgui>":     "@/<app>.webgui",
    "<appGuiService>": "@/<app>-gui.service",
    "<appWebservice>": "@/<app>.webservice"
    /* + services/libs de dependência */
  },
  "gui-host": {
    "webgui": "<appWebgui>",                 // qual bound-param é o webgui a compilar
    "guiService": "guiService",              // qual ref do grafo expõe Invoke/GetManifest/GetIcon
    "serviceGraph": [                        // grafo de services, ordenado por dependência
      { "ref": "guiService", "package": "<appGuiService>", "factory": "Services/<App>Gui.service",
        "boundServices": { "<param>": "<refDeOutroService>" },
        "boundLibs":     { "<param>": "<boundParamKeyDeUmPacote>" } }
    ]
  }
}
```

> **Importante:** a janela precisa de `dependency` (ex.: o próprio webgui) — o
> construtor do grafo de dependências ignora os `bound-params` de uma janela sem
> `dependency`, e sem os handles a janela nunca ativa.

Cada entrada do `serviceGraph` é instanciada com: `params` (bag escalar comum;
cada factory destrutura o que usa) + `boundServices` (refs a services já
instanciados) + `boundLibs` (handles de pacote, reconstruídos dos caminhos). O
`guiService` retornado expõe:

- `Invoke(serviceName, method, data)` — encaminha ao controller. **Espelha o
  contrato de invocação do servidor HTTP**: 0 params → `method()`; 1 param →
  `method(valor)`; 2+ → `method(objeto)` (IPC vira drop-in transparente do
  webservice).
- `GetManifest()` — `{ apiName: [summaries] }` (chaves = `summary` dos `.api.json`).
- `GetIcon({ kind, args })` — caminho de arquivo do ícone (opcional; servido pelo
  protocolo `metaicon://`).

### Como criar/migrar um `.desktopapp` para GUI-host

1. **`<app>-gui.service`** (novo `.service`): **compõe** os controllers já
   existentes do `<app>.webservice` — requer via `webserviceHandle.require(...)`
   os `Controllers/*` e `APIs/*.api.json`; expõe `Invoke`/`GetManifest`
   (+`GetIcon` se houver ícones). **Não duplica lógica** — a webservice segue
   como fonte única (dual-transport). Modelos: `desktop-gui.service`,
   `api-designer-gui.service`, `datasource-gui.service`.
2. **webgui**: transporte plugável. Faça `GetAPI`/`GetRequestByServer` ramificar
   para um `GetRequestByIPC` (Proxy sobre `window.metaGui.invoke`, devolvendo
   `{ data }`) quando `window.metaGui` existir; ícones viram `metaicon://`; o
   bootstrap (`App.container`) pula o `axios.get` do server-manager e sintetiza a
   lista de servidores só para passar o *gate* de render.
3. **`boot.json`**: substitua `services`/`endpoints`/`windows[url]` por uma janela
   com o spec `gui-host` (acima); `startup-params` perde `port`/`serverManagerUrl`/
   `windowUrl`.

> ⚠️ **WebSocket streaming** (log/console/execução ao vivo) ainda **não** é
> coberto: `metaGui.invoke` é request/response. Apps com streaming
> (ecosystem-control-panel, package-developer) precisam de um primitivo de stream
> na ponte IPC antes de migrar — até lá seguem no modo `loadURL`/HTTP.

## Dependência

Declara `electron` em `package.json`. Como qualquer dependência de package, é
instalada no ambiente de execução pela task `install-nodejs-package-dependencies`
— não há `npm install` global. No modo `gui-host`, `webpack`/`html-webpack-plugin`
são resolvidos de `EXTERNAL_NODE_MODULES_PATH` (herdado do host pelo `spawn`).

> Parâmetros e exemplo no `execution-params`: ver
> [Tipos de Object Loader → `desktop-window-instance`](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/concepts/tipos-de-object-loader.md#desktop-window-instance).
> Para criar o seu próprio loader, veja o
> [Guia: como criar e usar um Object Loader](../../Executor.layer/task-executor.lib/docs/guia-criar-object-loader.md).
> [README do repositório](../../../README.md)
