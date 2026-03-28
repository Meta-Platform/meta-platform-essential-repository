# Ecosystem Install Utilities

## Visão Geral

A **Ecosystem Install Utilities** é uma biblioteca central do ecossistema, responsável por concentrar **toda a regra de administração, instalação, atualização e manutenção de ecossistemas**. Ela atua como a base operacional para ferramentas críticas, incluindo:

* **mywizard** – assistente oficial de instalação e atualização de ecossistemas
* **Repository Manager (CLI)** – gerenciamento de repositórios via linha de comando
* **Maintenance Toolkit** – ferramentas de manutenção e reparo do ecossistema

Esta biblioteca abstrai a complexidade de obtenção de repositórios, instalação de aplicações, atualização de versões, reconstrução de estrutura e validação de estado do ecossistema, garantindo consistência entre todas as ferramentas que a utilizam.

---

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
│       ├── CreateEcosystemDefaultsJsonFile.js
│       └── DownloadPackageExecutorBin.js
│
├── Helpers/
│   ├── PrepareContext.js
│   ├── ConvertPathToAbsolutPath.js
│   ├── BuildCommandLineApplicationScriptContent.js
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

---

## API – Funções Públicas

| Função                    | Módulo                         | Parâmetros                                 | Retorno       | Descrição                                                                                                  |
| ------------------------- | ------------------------------ | ------------------------------------------ | ------------- | ---------------------------------------------------------------------------------------------------------- |
| InstallEcosystemByProfile | InstallEcosystemByProfile.js   | profile:Object, options:Object             | Promise<void> | Instala um ecossistema completo a partir de um perfil declarativo, orquestrando repositórios e aplicações. |
| UpdateEcosystemByProfile  | UpdateEcosystemByProfile.js    | profile:Object, options:Object             | Promise<void> | Atualiza um ecossistema existente preservando estado e compatibilidade.                                    |
| InstallRepository         | InstallRepository.js           | repositoryConfig:Object, context:Object    | Promise<void> | Obtém, valida e registra um repositório no ecossistema.                                                    |
| UpdateRepository          | UpdateRepository.js            | repositoryConfig:Object, context:Object    | Promise<void> | Atualiza um repositório já instalado aplicando regras de limpeza e migração.                               |
| ChangeRepositorySource    | ChangeRepositorySource.js      | repositoryId:string, newSource:Object      | Promise<void> | Altera a origem de download de um repositório mantendo seu registro interno.                               |
| InstallApplication        | Install/InstallApplication.js  | applicationMetadata:Object, context:Object | Promise<void> | Instala uma aplicação individual dentro de um repositório.                                                 |
| ReinstallApplication      | Update/ReinstallApplication.js | applicationMetadata:Object, context:Object | Promise<void> | Reinstala uma aplicação garantindo estado limpo.                                                           |

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
