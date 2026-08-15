import type { EcosystemDefaults } from "../../ecosystem-defaults-handler.lib/src/Get"

/**
 * Contratos do script-file-utilities.lib.
 *
 * Os `RENDER_*` são o vocabulário do template de shell: cada um vira um trecho
 * literal do script executável gerado.
 */

export type ExecutionContentParams = {
    RENDER_BINARY_DIR_PATH: string
    RENDER_ECOSYSTEM_DATA_PATH: string
    RENDER_PKG_CONF_DIRNAME_METADATA: string
    RENDER_DIRNAME_MINIMAL_NODEJS_DEPENDENCIES: string
    RENDER_DIRNAME_CONFIGURATIONS_DIR: string
    RENDER_DIRNAME_DOWNLOADED_REPOSITORIES?: string
    debugMode?: boolean
}

/** Gerador do conteúdo do script — um por tipo de aplicação. */
export type BuildContentFunction = (params: ExecutionContentParams) => string

export type CreatePackageExecutableScriptParams = {
    installationDataDir: string
    ecosystemDefaults: EcosystemDefaults
    packageExecutorBinaryName: string
    buildContentFunction: BuildContentFunction
    executableScriptFilename: string
    debugMode?: boolean
}

export type CreateExecutableScriptFn = (filePath: string, content: string) => Promise<void>
export type CreateUtf8TextFileFn = (filePath: string, content: string) => Promise<void>
export type MakeFileExecutableFn = (filePath: string) => Promise<void>
export type RemoveExecutableScriptFn = (filePath: string) => Promise<void>
