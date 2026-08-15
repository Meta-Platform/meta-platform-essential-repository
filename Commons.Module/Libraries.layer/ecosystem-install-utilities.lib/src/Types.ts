import type { EcosystemDefaults } from "../../ecosystem-defaults-handler.lib/src/Get"
import type { InstalledApplication, SourceData } from "../../repository-config-handler.lib/src/Types"

/**
 * Contratos do ecosystem-install-utilities.lib — a lib que instala, atualiza e
 * desinstala repositórios e aplicações de um ecossistema.
 */

export type { EcosystemDefaults, InstalledApplication, SourceData }

/**
 * Onde o ecossistema vive, já com o `~` resolvido, e onde ficam as dependências
 * npm dele. Sai do PrepareContext e acompanha toda operação de instalação.
 */
export type InstallationContext = {
    installDataDirPath: string
    npmDependenciesContextPath: string
}

/** O que identifica um repositório a instalar ou atualizar. */
export type RepositoryRef = {
    repositoryNamespace: string
    sourceData?: SourceData
}

/**
 * Uma entrada do perfil de instalação: qual repositório instalar, de onde, e
 * quais executáveis dele publicar no ecossistema.
 */
export type RepositoryInstallData = {
    namespace: string
    sourceData: SourceData
    executablesToInstall?: string[]
}

/**
 * O que um template de script executável precisa saber: qual pacote sobe, por
 * qual socket é supervisionado e a partir de qual repositório.
 */
export type ScriptContentParams = {
    PACKAGE_REPO_PATH: string
    supervisorSocketFilePath: string
    REPOSITORY_PATH: string
    debugMode?: boolean
}

/*
 * A `sourceData` chega de JSON, com todos os campos opcionais — é o que o
 * arquivo permite. Cada estratégia de obtenção, porém, só roda para o seu
 * `sourceType`, e aí os campos daquele tipo existem. Os tipos abaixo dizem isso
 * no ponto exato em que a estratégia assume o que precisa.
 */
export type LocalFsSource = SourceData & { path: string }
export type GoogleDriveSource = SourceData & { fileId: string }
export type GithubReleaseSource = SourceData & { repositoryOwner: string, repositoryName: string }

/** Entrada comum das estratégias de obtenção de repositório. */
export type ObtainRepositoryArgs = {
    sourceData: SourceData
    destinationRepoPath: string
    repositoryNamespace?: string
}
