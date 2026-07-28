const SmartRequire = require("../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const ChangeSourceRepository = require("../../repository-config-handler.lib/src/ChangeSourceRepository")

const ChangeRepositorySource = async ({
    repositoryNamespace,
    sourceData,
    installDataDirPath,
    ecosystemDefaults
}) => {

    const { 
        REPOS_CONF_FILENAME_REPOS_DATA,
    } = ecosystemDefaults

    Log.info("ChangeRepositorySource", `Mudando fonte do repositório ${colors.bold(repositoryNamespace)}...`)

    await ChangeSourceRepository({
        repositoryNamespace,
        sourceData,
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA
    })

    Log.info("ChangeRepositorySource", `A Instalação do repositório ${colors.bold("namespace")} pela fonte do tipo [${colors.inverse(sourceData.sourceType)}] foi concluída!`)
}

module.exports = ChangeRepositorySource