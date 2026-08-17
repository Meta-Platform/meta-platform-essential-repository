const SmartRequire = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")

const { join } = require("path")
const { writeFile } = require("fs/promises")
const fs = require("fs") as typeof import("fs")

// O arborist é o npm inteiro — 35 MiB medidos só de carregar, e ele fica no
// require cache pelo resto da vida do processo, que é de dias. Carregado sob
// demanda, e depois da verificação lá embaixo: num container as dependências já
// vieram instaladas na imagem, então na prática ele nunca entra.
//
// Adiar o require é seguro AQUI porque o SmartRequire resolve por
// EXTERNAL_NODE_MODULES_PATH, que o executor define uma vez para o processo
// inteiro e nunca desfaz. É diferente do NODE_PATH do nodejs-package.taskLoader,
// que só vale durante a carga do arquivo e faz require adiado falhar sempre.
let ArboristModule: any
const LoadArborist = () => {
    if(!ArboristModule) ArboristModule = SmartRequire("@npmcli/arborist")
    return ArboristModule
}

// Assinatura do que se pediu para instalar. Não é hash: é o próprio pedido,
// legível, para que um humano abrindo o arquivo entenda por que a instalação
// foi pulada.
const MANIFEST_FILENAME = ".meta-dependencies.json"

const ReadInstalledManifest = (contextPath: string) => {
    try {
        return JSON.parse(fs.readFileSync(join(contextPath, MANIFEST_FILENAME), "utf8"))
    } catch(e) {
        return undefined
    }
}

// Duas condições, e as duas precisam valer.
//
// A primeira é o pedido: mudou uma versão, entrou uma dependência, mudou um
// `override` — reinstala. A segunda é o disco: o manifesto pode estar certo e o
// `node_modules` ter sido podado, e aí acreditar no manifesto entregaria um
// serviço que morre em "Cannot find module" no primeiro require. Conferir a
// presença de cada pacote declarado custa um `stat` por dependência.
const IsAlreadySatisfied = ({ contextPath, dependenciesForAdd, overrides }: {
    contextPath: string
    dependenciesForAdd: string[]
    overrides: any
}) => {

    if(process.env.META_FORCE_NPM_REIFY) return false

    const manifest = ReadInstalledManifest(contextPath)
    if(!manifest) return false

    const mesmoPedido =
        JSON.stringify(manifest.dependencies) === JSON.stringify(dependenciesForAdd) &&
        JSON.stringify(manifest.overrides || null) === JSON.stringify(overrides || null)

    if(!mesmoPedido) return false

    return dependenciesForAdd.every((entry) => {
        // "@escopo/nome@versão" e "nome@versão": o nome é tudo antes do ÚLTIMO
        // "@", e o escopo começa com um "@" que não conta.
        const nome = entry.slice(0, entry.lastIndexOf("@", entry.length - 1))
        return fs.existsSync(join(contextPath, "node_modules", nome))
    })
}

const WriteInstalledManifest = async ({ contextPath, dependenciesForAdd, overrides }: {
    contextPath: string
    dependenciesForAdd: string[]
    overrides: any
}) =>
    writeFile(
        join(contextPath, MANIFEST_FILENAME),
        `${JSON.stringify({ dependencies: dependenciesForAdd, overrides: overrides || null }, null, 2)}\n`,
        "utf8"
    )

// O diretório de instalação começa vazio e o arborist recebe as dependências por
// `add`. Sem um package.json ali, não há onde declarar `overrides` — e sem
// `overrides` o npm não tem como resolver um conflito de peer transitivo.
//
// O caso que obrigou isto: styled-components 6 declara peer OPCIONAL em
// react-native, que exige react 19. Enquanto o consumidor declarava react 18, ele
// ancorava a resolução. Ao mover o react para a biblioteca de UI, o npm passou a
// escalar pelo react-native e a instalação falhava com ERESOLVE — produzindo
// ZERO módulos, em silêncio.
const WriteResolutionManifest = async ({ contextPath, packageName, overrides }: { contextPath: any, packageName: any, overrides: any }) => {
    if(!overrides || Object.keys(overrides).length === 0) return
    const manifest = {
        name: `${packageName}-dependencies`,
        version: "0.0.0",
        private: true,
        overrides
    }
    await writeFile(join(contextPath, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8")
}

const InstallNpmPackage = async ({
    environmentPath,
    packageName,
    dependencies,
    overrides,
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
}: {
    environmentPath: string
    packageName: any
    dependencies: any
    overrides: any
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES: any
}) => {
    const dependenciesForAdd = Object.keys(dependencies)
        .map((name: any) => {
            const version = dependencies[name]
            return `${name}@${version}`
        })

    const contextPath = join(environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES, packageName)

    // Pular aqui é o que mantém o arborist fora do heap: num container as
    // dependências chegam instaladas na imagem e este caminho é o normal, não a
    // exceção. `META_FORCE_NPM_REIFY=1` desliga o atalho quando se precisa que o
    // arborist reconcilie a árvore de verdade.
    if(IsAlreadySatisfied({ contextPath, dependenciesForAdd, overrides })){
        Log.info("InstallNpmPackage", `dependências de ${packageName} já satisfeitas; instalação dispensada`)
        return
    }

    await WriteResolutionManifest({ contextPath, packageName, overrides })
    const Arborist = LoadArborist()
    const arborist = new Arborist({ path: contextPath, progress:true})
    await arborist.reify({add:dependenciesForAdd})
    // Só depois do reify: um manifesto escrito antes transformaria uma
    // instalação interrompida em "já satisfeita" no próximo boot.
    await WriteInstalledManifest({ contextPath, dependenciesForAdd, overrides })
}

InstallNpmPackage.IsAlreadySatisfied     = IsAlreadySatisfied
InstallNpmPackage.WriteInstalledManifest = WriteInstalledManifest
InstallNpmPackage.MANIFEST_FILENAME      = MANIFEST_FILENAME

module.exports = InstallNpmPackage