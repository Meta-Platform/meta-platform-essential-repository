# ecosystem-defaults-handler.lib

- **Tipo:** biblioteca (`.lib`)
- **Namespace:** `@/ecosystem-defaults-handler.lib`
- **Localização:** `Commons.Module/Libraries.layer/ecosystem-defaults-handler.lib` (EssentialRepo)

## Propósito

Acessador **único** do arquivo `ecosystem-defaults.json`. Centraliza a leitura
das variáveis de configuração do ecossistema (as chaves `REPOS_CONF_*`,
`PKG_CONF_*`, `ECOSYSTEMDATA_CONF_*` e `EXECUTIONDATA_CONF_*`), de modo que
serviços e CLIs deixem de resolver e ler esse arquivo por conta própria e
passem a delegar a esta lib.

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `Get.js` | Resolve o caminho do `ecosystem-defaults.json`, lê o JSON e retorna o objeto com as variáveis. Lança erro explícito se o arquivo não existir (ecossistema não instalado). |

## Uso

```js
const Get = ecosystemDefaultsHandlerLib.require("Get")

const ecosystemDefaults = Get(ecosystemDataPath, ecosystemDefaultsFileRelativePath)
// => { REPOS_CONF_FILENAME_SOURCE_DATA: "sources.json", ... }
```

> [README do repositório](../../../README.md)
