const ResolvePackageResourceParams = require("./ResolvePackageResourceParams")

// Injeta os caminhos resolvidos no `startup-params` de cada nó da hierarquia que
// declara recursos, e devolve também a lista do que foi resolvido (é o inventário
// do que está mapeado — o dado que um gerenciador de storage precisa mostrar).
//
// POR QUE ISTO RODA DEPOIS DO BuildMetadataHierarchy
//
// O merge por-nó do BuildMetadataHierarchy é `{ ...injetado, ...próprio }`: o
// `startup-params.json` do pacote sobrepõe a base do ecossistema. Se os recursos
// entrassem como base, um `"socket"` literal esquecido no metadata continuaria
// mandando — exatamente o caminho absoluto que este mecanismo existe para
// eliminar. Aplicando depois, o recurso declarado vence e o literal fica valendo
// só para quem ainda não declarou nada.
const ApplyResourceParamsToHierarchy = ({
    metadataHierarchy,
    installDataDirPath,
    ECOSYSTEMDATA_CONF_DIRNAME_UNIX_SOCKET_DIR,
    ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR,
    ECOSYSTEMDATA_CONF_DIRNAME_STORAGE_DIR
}) => {

    if(!metadataHierarchy || !Array.isArray(metadataHierarchy.dependencyList))
        return { metadataHierarchy, resources: [] }

    const resources = []

    const dependencyList = metadataHierarchy.dependencyList.map((item) => {

        const metadata = item && item.dependency && item.dependency.metadata
        if(!metadata) return item

        const packageResources = ResolvePackageResourceParams({
            metadata,
            installDataDirPath,
            ECOSYSTEMDATA_CONF_DIRNAME_UNIX_SOCKET_DIR,
            ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR,
            ECOSYSTEMDATA_CONF_DIRNAME_STORAGE_DIR
        })

        if(packageResources.length === 0) return item

        // O caminho do pacote acompanha o recurso: sem ele o inventário diz
        // "existe um socket" sem dizer de quem.
        packageResources.forEach((resource) => resources.push({ ...resource, packagePath: item.dependency.path }))

        const resolvedParams = packageResources
            .reduce((acc, { parameter, path }) => ({ ...acc, [parameter]: path }), {})

        return {
            ...item,
            dependency: {
                ...item.dependency,
                metadata: {
                    ...metadata,
                    ["startup-params"]: { ...metadata["startup-params"], ...resolvedParams }
                }
            }
        }
    })

    return {
        metadataHierarchy: { ...metadataHierarchy, dependencyList },
        resources
    }
}

module.exports = ApplyResourceParamsToHierarchy
