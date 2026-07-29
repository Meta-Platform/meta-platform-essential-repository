const path = require("path")

const SmartRequire = require("../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const InstallEcosystem = require("./Install/InstallEcosystem")
const InstallRepository = require("./InstallRepository")

const SynchronizeNodejsDependencies    = require("./Helpers/SynchronizeNodejsDependencies")
const CollectTaskLoaderNpmDependencies = require("./Helpers/CollectTaskLoaderNpmDependencies")
const PrepareContext                   = require("./Helpers/PrepareContext")

/*
 * PONTO DE ENTRADA DA INSTALAÇÃO — garante `globalThis.Log` antes de qualquer
 * uso (VDRP-275).
 *
 * Toda esta árvore chama `Log.<nível>` direto, que é o contrato do logger
 * global. Só que quem instala o global é o bootstrap do processo, e esta função
 * roda justamente para o ecossistema passar a existir: chamada por um binário
 * (mywizard, package-executor) que carregou esta lib por LoaderScript, `Log`
 * pode não estar instalado. Sem esta garantia, o primeiro `Log.info` lança
 * `ReferenceError: Log is not defined` e — dentro de um `catch` — apaga a causa
 * real da falha.
 *
 * Foi o que travou o provisionamento da plataforma VirtualDesk em 29/07/2026: o
 * `mywizard install release-standard` morria dentro do build de imagem com "Log
 * is not defined" e o motivo verdadeiro nunca chegava ao operador.
 *
 * O logger garantido aqui é mínimo (só console) e fica marcado como tal — o
 * InstallGlobalLogger o substitui pelo canônico quando o ecossistema existir.
 */
const EnsureGlobalLogger = require("../../logger.lib/src/EnsureGlobalLogger")

const InstallEcosystemByProfile = async ({
    ecosystemDefaults,
    npmDependencies,
    initialRepositorySource,
    profile,
    installationDataDir,
    repositoriesInstallData,
    installationPath
}) => {

    EnsureGlobalLogger()

    Log.info("InstallEcosystemByProfile", `Início de instalação usando o perfil ${colors.bold(path.basename(profile))}`)

    const context = PrepareContext({
        installationDataDir,
        ecosystemDefaults,
        installationPath
    })

    const {
        installDataDirPath,
        npmDependenciesContextPath
    } = context

    await InstallEcosystem({
        ecosystemDefaults,
        installationDataDir:installDataDirPath,
        initialRepositorySource
    })

    await SynchronizeNodejsDependencies({
        contextPath: npmDependenciesContextPath,
        dependencies: npmDependencies
    })

    if(repositoriesInstallData){
        for (const repositoryInstallData of repositoriesInstallData) {
            const { 
                namespace: repositoryNamespace,
                sourceData,
                executablesToInstall
             } = repositoryInstallData
            await InstallRepository({
                repositoryNamespace,
                sourceData,
                executablesToInstall,
                installDataDirPath,
                ecosystemDefaults
            })
        }
    }

    // Depois de instalar os repositórios, combina as `npmDependencies` declaradas nos
    // taskloaders.json instalados com a base e re-sincroniza o diretório de dependências
    // compartilhado (MPTL-17). Deps específicas de loader (electron, webpack, …) passam
    // a vir dos taskloaders; a base cobre só as deps de runtime da plataforma. Base vence
    // em versões compartilhadas.
    const taskLoaderNpmDependencies = CollectTaskLoaderNpmDependencies({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA: ecosystemDefaults.REPOS_CONF_FILENAME_REPOS_DATA
    })
    await SynchronizeNodejsDependencies({
        contextPath: npmDependenciesContextPath,
        dependencies: { ...taskLoaderNpmDependencies, ...npmDependencies }
    })

    Log.info("InstallEcosystemByProfile", `Fim da instalação do perfil ${colors.bold(path.basename(profile))}!`)
}

module.exports = InstallEcosystemByProfile