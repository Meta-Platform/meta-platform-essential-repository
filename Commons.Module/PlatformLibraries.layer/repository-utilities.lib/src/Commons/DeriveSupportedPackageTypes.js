const { join } = require("path")
const os = require("os")
const fs = require("fs")

// Tipos ESTRUTURAIS — existem em qualquer repositório e são necessários à plataforma
// (bibliotecas e loaders), independentemente da capacidade que o repo "habilita".
// Sempre entram na whitelist.
const STRUCTURAL_PKG_TYPES = ["lib", "taskLoader"]

const ToAbsolute = (p) => String(p || "").replace("~", os.homedir())

// Deriva a whitelist de tipos de pacote (REPOS_CONF_EXTLIST_PKG_TYPE) a partir da UNIÃO
// dos `supportedPackageTypes` declarados nos `repository.json` dos repositórios
// instalados, mais os tipos estruturais. Assim, "quais tipos de pacote o ecossistema
// reconhece" passa a depender de quais repositórios estão instalados
// (ex.: sem o EcosystemCoreRepo, `webapp/webgui/webservice` não entram).
//
// Sem fallback (ver MPTL-12): um repositório sem `repository.json` não contribui tipos.
// Retorna a string no formato "a|b|c" esperado pela descoberta.
const DeriveSupportedPackageTypes = ({ installDataDirPath, REPOS_CONF_FILENAME_REPOS_DATA }) => {

    const reposFilePath = join(ToAbsolute(installDataDirPath), REPOS_CONF_FILENAME_REPOS_DATA)
    const repositoriesData = JSON.parse(fs.readFileSync(reposFilePath, { encoding: "utf8" }))

    const types = new Set(STRUCTURAL_PKG_TYPES)

    for (const repositoryNamespace of Object.keys(repositoriesData)) {
        const repositoryJsonPath = join(
            ToAbsolute(repositoriesData[repositoryNamespace].installationPath),
            "metadata",
            "repository.json"
        )
        if (!fs.existsSync(repositoryJsonPath)) continue
        const { supportedPackageTypes = [] } =
            JSON.parse(fs.readFileSync(repositoryJsonPath, { encoding: "utf8" }))
        supportedPackageTypes.forEach((t) => types.add(t))
    }

    return [...types].join("|")
}

module.exports = DeriveSupportedPackageTypes
