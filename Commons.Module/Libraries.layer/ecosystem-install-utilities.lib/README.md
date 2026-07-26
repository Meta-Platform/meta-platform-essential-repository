# ecosystem-install-utilities.lib

- **Tipo:** biblioteca (`.lib`)
- **Namespace:** `@/ecosystem-install-utilities.lib`
- **Localização:** `Commons.Module/Libraries.layer/ecosystem-install-utilities.lib` (EssentialRepo)

## Propósito

A **Ecosystem Install Utilities** é uma biblioteca central do ecossistema, responsável por concentrar **toda a regra de administração, instalação, atualização e manutenção de ecossistemas**. Ela atua como a base operacional para ferramentas críticas, incluindo:

* **mywizard** – assistente oficial de instalação e atualização de ecossistemas
* **Repository Manager (CLI)** – gerenciamento de repositórios via linha de comando
* **Maintenance Toolkit** – ferramentas de manutenção e reparo do ecossistema

Esta biblioteca abstrai a complexidade de obtenção de repositórios, instalação de aplicações, atualização de versões, reconstrução de estrutura e validação de estado do ecossistema, garantindo consistência entre todas as ferramentas que a utilizam.

---

## Exports (`src/`)

| Módulo | Responsabilidade |
|---|---|
| `InstallEcosystemByProfile.js` | Instala um ecossistema inteiro a partir de um perfil. |
| `UpdateEcosystemByProfile.js` | Atualiza um ecossistema inteiro a partir de um perfil. |
| `InstallRepository.js` | Instala um repositório de pacotes. |
| `UpdateRepository.js` | Atualiza um repositório já instalado. |
| `ChangeRepositorySource.js` | Troca a fonte de atualização de um repositório. |
| `UninstallApplication.js` | Remove uma aplicação instalada e seus executáveis. |
| `Domains/` | Construção e restauração da estrutura de diretórios do ecossistema. |
| `Install/` · `Update/` | Instalação e reinstalação de aplicações. |
| `Helpers/` | Obtenção de repositórios, scripts de executável, dependências Node.js e verificações de estado. |

## Estrutura Interna (`src`)

```
src/
├── InstallEcosystemByProfile.js
├── InstallRepository.js
├── UpdateRepository.js
├── UpdateEcosystemByProfile.js
├── ChangeRepositorySource.js
│
├── Install/
│   ├── InstallApplication.js
│   └── InstallEcosystem/
│       ├── index.js
│       ├── Install.js
│       ├── InstallPackageExecutor.js
│       ├── DownloadPackageExecutorBin.js
│       ├── CreateEcosystemDefaultsJsonFile.js
│       └── CreateRepositorySource.js
│
├── Update/
│   ├── ReinstallApplication.js
│   └── UpdateEcosystem/
│       ├── index.js
│       ├── Update.js
│       ├── UpdatePackageExecutor.js
│       ├── CreateEcosystemDefaultsJsonFile.js
│       └── DownloadPackageExecutorBin.js
│
├── Helpers/
│   ├── PrepareContext.js
│   ├── ConvertPathToAbsolutPath.js
│   ├── SynchronizeNodejsDependencies.js
│   ├── BuildApplicationScriptContent.js
│   ├── BuildCommandLineApplicationScriptContent.js
│   ├── BuildDesktopAppScriptContent.js
│   ├── BuildObjectFromPrefix.js
│   ├── RestoreDir.js
│   ├── VerifyDirExit.js
│   ├── CleanOldRepository.js
│   ├── FetchInstalledRepositoriesInfo.js
│   ├── VerifyIfAllRepositoriesAreRegistered.js
│   ├── FilterApplicationsMetadataByExecutablesToInstall.js
│   └── ObtainRepository/
│       ├── index.js
│       ├── ObtainFromLocalFS.js
│       ├── DownloadFromGoogleDrive.js
│       └── DownloadFromGithubRelease.js
│
└── Domains/
    ├── ConstructEcosystemStructure.js
    └── RestoreEcosystemStructure.js
```

> As funções de construção de script incluem `BuildDesktopAppScriptContent.js`,
> usada para instalar/reinstalar packages `.desktopapp` (`appType` `DESKTOP`),
> além das variantes de CLI (`command-line`) e aplicação (`app`).

---

## API – Funções Públicas

Todas as funções recebem **um único objeto** com parâmetros nomeados (não
argumentos posicionais). O `loggerEmitter` (um `EventEmitter`) é opcional em todas.

| Função | Módulo | Parâmetros (chaves do objeto) | Retorno | Descrição |
| ------ | ------ | ----------------------------- | ------- | --------- |
| InstallEcosystemByProfile | InstallEcosystemByProfile.js | `{ ecosystemDefaults, npmDependencies, initialRepositorySource, profile, installationDataDir, repositoriesInstallData, installationPath, loggerEmitter }` | `Promise<void>` | Instala um ecossistema completo a partir de um perfil declarativo, orquestrando repositórios e aplicações. |
| UpdateEcosystemByProfile | UpdateEcosystemByProfile.js | objeto único de configuração (análogo a `InstallEcosystemByProfile`) | `Promise<void>` | Atualiza um ecossistema existente preservando estado e compatibilidade. |
| InstallRepository | InstallRepository.js | `{ repositoryNamespace, sourceData, executablesToInstall, installDataDirPath, ecosystemDefaults, loggerEmitter }` | `Promise<void>` | Obtém, valida e registra um repositório e instala seus executáveis. |
| UpdateRepository | UpdateRepository.js | `{ repositoryNamespace, executablesToInstall, installDataDirPath, ecosystemDefaults, loggerEmitter }` | `Promise<void>` | Atualiza um repositório já instalado aplicando limpeza e reinstalação. |
| ChangeRepositorySource | ChangeRepositorySource.js | `{ repositoryNamespace, sourceData, installDataDirPath, ecosystemDefaults, loggerEmitter }` | `Promise<void>` | Altera a origem (`sourceData`) de um repositório mantendo seu registro interno. |
| InstallApplication | Install/InstallApplication.js | `{ namespace, deployedRepoPath, applicationData, installDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR, REPOS_CONF_FILENAME_REPOS_DATA, supervisorSocketDirPath, loggerEmitter }` | `Promise<string>` (caminho do script do executável gerado) | Instala uma aplicação individual (`CLI`/`APP`/`DESKTOP`) dentro de um repositório. |
| ReinstallApplication | Update/ReinstallApplication.js | `{ namespace, applicationData, deployedRepoPath, installDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR, supervisorSocketDirPath, loggerEmitter }` | `Promise<string>` (caminho do script do executável gerado) | Reinstala uma aplicação recriando o script do executável. |

---

## Domínios

### ConstructEcosystemStructure(context)

Cria a estrutura física padrão do ecossistema no sistema de arquivos.

### RestoreEcosystemStructure(context)

Restaura a estrutura do ecossistema a partir de informações registradas.

---

## Helpers (Uso Interno)

Os helpers fornecem funcionalidades reutilizáveis como:

* Preparação de contexto de execução
* Validação e restauração de diretórios
* Download de repositórios (GitHub Releases, Google Drive, FS local)
* Filtragem de aplicações instaláveis
* Reconstrução de objetos a partir de prefixos

---

## Papel no Ecossistema

Esta biblioteca é o **núcleo operacional do ecossistema**, sendo responsável por garantir:

* Padronização de instalações
* Atualizações seguras e rastreáveis
* Reprodutibilidade de ambientes
* Integração consistente entre ferramentas oficiais

Sem ela, ferramentas como **mywizard**, Repository Manager e Maintenance Toolkit não conseguiriam operar de forma confiável.
