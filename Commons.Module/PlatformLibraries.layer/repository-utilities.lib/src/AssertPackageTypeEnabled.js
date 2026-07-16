const { basename } = require("path")
const DeriveSupportedPackageTypes = require("./Commons/DeriveSupportedPackageTypes")

// Gate de tipos (MPTL-18): recusa a execução de um pacote cujo tipo NÃO esteja
// habilitado pelos repositórios instalados (whitelist derivada em MPTL-16).
// Ex.: tentar rodar um `.desktopapp` sem o PlatformApplicationsRepo instalado dá uma
// mensagem clara em vez de um erro obscuro de "pacote não encontrado no grafo".
const AssertPackageTypeEnabled = ({
    packagePath,
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA
}) => {
    const packageType = basename(packagePath).split(".").pop()

    const enabledTypes = DeriveSupportedPackageTypes({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA
    }).split("|")

    if (!enabledTypes.includes(packageType)) {
        throw new Error(
            `Tipo de pacote ".${packageType}" não habilitado neste ecossistema. ` +
            `Instale o repositório que fornece esse tipo. ` +
            `Tipos habilitados: ${enabledTypes.join(", ")}.`
        )
    }
}

module.exports = AssertPackageTypeEnabled
