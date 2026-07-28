const ResolvePackageResourceParams   = require("./ResolvePackageResourceParams")
const DetectResourceParamCollisions  = require("./DetectResourceParamCollisions")
const { BuildCollisionError }        = DetectResourceParamCollisions

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
//
// COLISÃO DE NOME — por que a checagem mora aqui
//
// Este é o único ponto que conhece, ao mesmo tempo, o valor que o parâmetro já
// tinha e o caminho que o recurso vai impor. Quem chama vê só o resultado do
// merge, onde os dois já viraram um. Por isso a detecção sai daqui junto com o
// resultado, e a POLÍTICA (recusar ou seguir avisando) fica com o chamador:
// falhar alto é certo no provisionamento, e discutível para uma instalação que
// já está no ar com a colisão — derrubá-la no boot não desfaz o desvio.
const ApplyResourceParamsToHierarchy = ({
    metadataHierarchy,
    installDataDirPath,
    ECOSYSTEMDATA_CONF_DIRNAME_UNIX_SOCKET_DIR,
    ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR,
    ECOSYSTEMDATA_CONF_DIRNAME_STORAGE_DIR,
    failOnCollision = false
}) => {

    if(!metadataHierarchy || !Array.isArray(metadataHierarchy.dependencyList))
        return { metadataHierarchy, resources: [], collisions: [] }

    const resources  = []
    const collisions = []

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

        // Antes de sobrepor: o que este nó já tinha para esses nomes? A checagem
        // vem aqui, e não depois do merge, porque depois do merge o valor antigo
        // não existe mais para ser comparado.
        DetectResourceParamCollisions({
            metadata,
            resources   : packageResources,
            packagePath : item.dependency.path
        }).forEach((collision) => collisions.push(collision))

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

    // Falha ANTES de devolver a hierarquia: quem pediu para recusar a colisão não
    // deve receber, nem por engano, um resultado já com o parâmetro sequestrado.
    if(failOnCollision && collisions.length > 0)
        throw BuildCollisionError(collisions)

    return {
        metadataHierarchy: { ...metadataHierarchy, dependencyList },
        resources,
        collisions
    }
}

module.exports = ApplyResourceParamsToHierarchy
