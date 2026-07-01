# desktop-window-instance.lib

- **Tipo:** biblioteca / *task loader* (`.lib`) · **Namespace:** `@/desktop-window-instance.lib`

*Object loader* do tipo **`desktop-window-instance`**: abre uma janela
[Electron](https://www.electronjs.org/) durante a execução de um plano pelo *task
executor*. Suporta dois modos:

- **`loadURL`** (`url`): a janela aponta para uma aplicação web **local** (ex.: o
  webapp que sobe junto, no mesmo `.desktopapp`, via `services`/`endpoints`). Modo
  usado pelo `api-designer.desktopapp`. A janela espera o `@@/server-service`
  ficar `ACTIVE` (via `agentLinkRules`) e reintenta o `loadURL` enquanto a
  interface ainda está compilando.
- **`loadFile`** (`file`, opcionalmente com `dependency`): carrega um HTML
  **local** do package indicado, para conteúdo estático autossuficiente.

É o loader que dá suporte aos packages do tipo
[`.desktopapp`](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/concepts/package.md):
cada entrada da seção `windows` do `boot.json` vira uma task
`desktop-window-instance`.

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `DesktopWindowInstance.taskLoader.js` | Carrega/instancia o `desktop-window-instance`; mantém a task `ACTIVE` enquanto a janela estiver aberta. |
| `OpenElectronWindow.js` | Faz `spawn` do binário do Electron apontando para `electron-main.js`. |
| `electron-main.js` | Processo *main* do Electron: cria a `BrowserWindow` e faz `loadFile` do HTML. |

## Dependência

Declara `electron` em `package.json`. Como qualquer dependência de package, é
instalada no ambiente de execução pela task `install-nodejs-package-dependencies`
— não há `npm install` global.

> Parâmetros e exemplo no `execution-params`: ver
> [Tipos de Object Loader → `desktop-window-instance`](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/concepts/tipos-de-object-loader.md#desktop-window-instance).
> Para criar o seu próprio loader, veja o
> [Guia: como criar e usar um Object Loader](../../Executor.layer/task-executor.lib/docs/guia-criar-object-loader.md).
> [README do repositório](../../../README.md)
