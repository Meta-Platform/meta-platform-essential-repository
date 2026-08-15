const path = require("path") as typeof import("path")
const fs = require("fs") as typeof import("fs")

const ToAbsolute = require("../../../../../Commons.Module/Utilities.layer/path-utilities.lib/src/ToAbsolutePath") as (value: unknown) => string

// Coleta e combina as `npmDependencies` declaradas nos `taskloaders.json` de todos os
// repositórios instalados (MPTL-17). O ecossistema passa a instalar, no diretório de
// dependências compartilhado, a UNIÃO das deps dos loaders instalados — em vez de uma
// lista fixa. Assim, instalar um repositório que traz um novo loader passa a trazer
// também as deps npm que ele precisa.
//
// Retorna um objeto { nome: versão }. Sem fallback: repo sem taskloaders.json não contribui.
const CollectTaskLoaderNpmDependencies = ({ installDataDirPath, REPOS_CONF_FILENAME_REPOS_DATA }: {
    installDataDirPath: string
    REPOS_CONF_FILENAME_REPOS_DATA: string
}): Record<string, string> => {

    const reposFilePath = path.join(ToAbsolute(installDataDirPath), REPOS_CONF_FILENAME_REPOS_DATA)
    if (!fs.existsSync(reposFilePath)) return {}

    const repositoriesData = JSON.parse(fs.readFileSync(reposFilePath, { encoding: "utf8" }))

    const collected: Record<string, string> = {}

    for (const repositoryNamespace of Object.keys(repositoriesData)) {
        const taskLoadersFilePath = path.join(
            ToAbsolute(repositoriesData[repositoryNamespace].installationPath),
            "metadata",
            "taskloaders.json"
        )
        if (!fs.existsSync(taskLoadersFilePath)) continue

        const { taskLoaders = [] } = JSON.parse(fs.readFileSync(taskLoadersFilePath, { encoding: "utf8" }))
        for (const taskLoader of taskLoaders as { npmDependencies?: Record<string, string> }[]) {
            Object.assign(collected, taskLoader.npmDependencies || {})
        }
    }

    return collected
}

module.exports = CollectTaskLoaderNpmDependencies
