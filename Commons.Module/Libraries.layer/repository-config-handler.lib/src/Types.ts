/**
 * Contratos do repository-config-handler.lib — a forma do `repositories.json`,
 * que é o registro de quais repositórios estão instalados no ecossistema e de
 * quais executáveis cada um publicou.
 */

/** De onde o repositório veio, e como buscá-lo de novo. */
export type SourceData = {
    sourceType: string
    path?: string
    fileId?: string
    repositoryOwner?: string
    repositoryName?: string
    [option: string]: any
}

export type InstalledApplication = {
    appType: string
    executable: string
    packageNamespace: string
    supervisorSocketFileName?: string
    [field: string]: any
}

export type RepositoryRecord = {
    installationPath: string
    sourceData: SourceData
    installedApplications: InstalledApplication[]
}

/** O arquivo inteiro, indexado pelo namespace do repositório. */
export type Repositories = Record<string, RepositoryRecord>

/**
 * Onde o arquivo de repositórios está. Toda função deste pacote precisa dos dois
 * — o diretório do EcosystemData e o nome do arquivo, que vem do
 * ecosystem-defaults — e é por isso que eles têm um nome próprio em vez de
 * aparecerem soltos em cada assinatura.
 */
export type RepositoriesFileRef = {
    installDataDirPath: string
    REPOS_CONF_FILENAME_REPOS_DATA: string
}

export type GetRepositoriesFn = (ref: RepositoriesFileRef) => Promise<Repositories>

export type GetRepositoriesFilePathFn = (ref: RepositoriesFileRef) => string

export type WriteRepositoriesFileJsonFn = (params: RepositoriesFileRef & { content: Repositories }) => Promise<void>

export type PrepareRepositoriesFileJsonFn = (ref: RepositoriesFileRef) => Promise<void>

export type VerifyRepoFileFn = (ref: RepositoriesFileRef) => Promise<boolean>
