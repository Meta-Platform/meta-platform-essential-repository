import type { EcosystemDefaults } from "../Types"

const path = require("path") as typeof import("path")
const os = require("os") as typeof import("os")

const CollectTaskLoaderNpmDependencies = require("./CollectTaskLoaderNpmDependencies") as (params: { installDataDirPath: string, REPOS_CONF_FILENAME_REPOS_DATA: string }) => Record<string, string>
const SynchronizeNodejsDependencies = require("./SynchronizeNodejsDependencies") as (params: { contextPath: string, dependencies: Record<string, string> }) => Promise<void>

const ToAbsolute = (p: unknown): string => String(p || "").replace("~", os.homedir())

// Um repositório que contribui um task loader também traz as dependências npm que aquele
// loader precisa. Sem este passo, instalar o repositório registra o loader mas o deixa
// inutilizável, e a falha só aparece na primeira execução que tenta usá-lo.
//
// A coleta é a UNIÃO das deps de todos os repositórios instalados, e a sincronização é
// aditiva, de modo que instalar ou atualizar um repositório nunca remove a dependência de
// outro. É isso que permite manter no núcleo apenas o mínimo: quem precisa de webpack, de
// um compilador de template ou de um runtime específico é o loader, e ele viaja com o
// repositório que o declara.
const SynchronizeTaskLoaderDependencies = async ({
    installDataDirPath,
    ecosystemDefaults
}: {
    installDataDirPath: string
    ecosystemDefaults?: EcosystemDefaults
}): Promise<void> => {

    const {
        REPOS_CONF_FILENAME_REPOS_DATA,
        ECOSYSTEMDATA_CONF_DIRNAME_NPM_DEPENDENCIES
    } = ecosystemDefaults || {}

    if(!REPOS_CONF_FILENAME_REPOS_DATA || !ECOSYSTEMDATA_CONF_DIRNAME_NPM_DEPENDENCIES) {
        Log.warn("SynchronizeTaskLoaderDependencies",
            "Configuração do ecossistema incompleta: as dependências de task loader não foram sincronizadas.")
        return
    }

    const dependencies = CollectTaskLoaderNpmDependencies({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA
    })

    if(!Object.keys(dependencies).length) return

    const contextPath = path.join(
        ToAbsolute(installDataDirPath),
        ECOSYSTEMDATA_CONF_DIRNAME_NPM_DEPENDENCIES
    )

    await SynchronizeNodejsDependencies({ contextPath, dependencies })
}

module.exports = SynchronizeTaskLoaderDependencies
