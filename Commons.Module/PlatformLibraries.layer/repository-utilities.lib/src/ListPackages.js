const ListLayers = require("./ListLayers")
const GetPackagesByLayer = require("./Commons/GetPackagesByLayer")
const DeriveSupportedPackageTypes = require("./Commons/DeriveSupportedPackageTypes")

const ListPackages = async ({
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA,
    REPOS_CONF_EXT_MODULE_DIR,
    REPOS_CONF_EXT_LAYER_DIR,
    REPOS_CONF_EXT_GROUP_DIR,
    REPOS_CONF_EXTLIST_PKG_TYPE
}) => {

    // A whitelist de tipos de pacote é DERIVADA dos `supportedPackageTypes` dos
    // repositórios instalados (união + tipos estruturais), não a string fixa recebida.
    // Assim os tipos reconhecidos dependem de quais repositórios estão instalados
    // (ver MPTL-16). Sem fallback: repo sem repository.json não contribui tipos.
    const extListPkgType = DeriveSupportedPackageTypes({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA
    })

    const listLayers = await ListLayers({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
        REPOS_CONF_EXT_MODULE_DIR,
        REPOS_CONF_EXT_LAYER_DIR
    })  

    const listPackages = listLayers
        .reduce(async (listPackagesPromise, { layerName, moduleName, namespaceRepo }) => {
            const listPackages = await listPackagesPromise;
            const listPackagesChunk = await GetPackagesByLayer({ 
                layerName,
                namespaceRepo, 
                moduleName,
                REPOS_CONF_EXT_LAYER_DIR,
                installDataDirPath,
                REPOS_CONF_FILENAME_REPOS_DATA,
                REPOS_CONF_EXT_MODULE_DIR,
                REPOS_CONF_EXT_GROUP_DIR,
                REPOS_CONF_EXTLIST_PKG_TYPE: extListPkgType

            })
            return [...listPackages, ...listPackagesChunk]
        }, Promise.resolve([]))

    return listPackages
}

module.exports = ListPackages