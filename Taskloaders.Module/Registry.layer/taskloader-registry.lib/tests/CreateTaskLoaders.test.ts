const { describe, it, beforeEach } = require("node:test") as typeof import("node:test")
const assert = (require("node:assert") as typeof import("node:assert")).strict
const fs     = require("node:fs") as typeof import("node:fs")
const os     = require("node:os") as typeof import("node:os")
const path   = require("node:path") as typeof import("node:path")

const CreateTaskLoaders = require("../src/CreateTaskLoaders")

globalThis.Log = globalThis.Log || { info: () => {}, error: () => {}, warn: () => {}, message: () => {} }

// Cada loader do fixture registra o próprio carregamento neste array. É a única
// forma de provar o que interessa aqui: não que o mapa funcione, mas QUANDO o
// `require` acontece.
const _MountRepository = (declarations: { type: string, injectsDeps?: boolean }[]) => {

    const installationPath = fs.mkdtempSync(path.join(os.tmpdir(), "tlr-"))
    const carregados: string[] = []

    ;(globalThis as any).__TLR_CARREGADOS__ = carregados

    const taskLoaders = declarations.map(({ type, injectsDeps }) => {

        const packagePath = `${type}.taskLoader`
        const entry       = "src/Loader"

        fs.mkdirSync(path.join(installationPath, packagePath, "src"), { recursive: true })
        fs.writeFileSync(
            path.join(installationPath, packagePath, `${entry}.js`),
            injectsDeps
                ? `globalThis.__TLR_CARREGADOS__.push("${type}")\n` +
                  `module.exports = (runtimeDeps) => ({ tipo: "${type}", runtimeDeps })\n`
                : `globalThis.__TLR_CARREGADOS__.push("${type}")\n` +
                  `module.exports = { tipo: "${type}" }\n`
        )

        return { objectLoaderType: type, path: packagePath, entry, injectsDeps: !!injectsDeps }
    })

    fs.mkdirSync(path.join(installationPath, "metadata"), { recursive: true })
    fs.writeFileSync(
        path.join(installationPath, "metadata", "taskloaders.json"),
        JSON.stringify({ taskLoaders })
    )

    return { repositoriesData: { RepoDeTeste: { installationPath } }, carregados }
}

describe("CreateTaskLoaders — carregamento sob demanda", () => {

    beforeEach(() => { (globalThis as any).__TLR_CARREGADOS__ = [] })

    it("não carrega nenhum loader ao montar o mapa", () => {
        const { repositoriesData, carregados } = _MountRepository([
            { type: "alfa" }, { type: "beta" }
        ])

        CreateTaskLoaders({ repositoriesData })

        // Este é o ganho de memória inteiro: um pacote sem interface deixou de
        // pagar o `endpoint-instance` e o `install-nodejs-package-dependencies`,
        // que arrasta o npm inteiro pelo `@npmcli/arborist`.
        assert.deepEqual(carregados, [])
    })

    it("os tipos aparecem no mapa mesmo sem terem sido carregados", () => {
        const { repositoriesData, carregados } = _MountRepository([
            { type: "alfa" }, { type: "beta" }
        ])

        const loaders = CreateTaskLoaders({ repositoriesData })

        // Object.keys lê as chaves, não os valores — não pode disparar o getter.
        assert.deepEqual(Object.keys(loaders).sort(), ["alfa", "beta"])
        assert.deepEqual(carregados, [])
    })

    it("carrega só o tipo consultado", () => {
        const { repositoriesData, carregados } = _MountRepository([
            { type: "alfa" }, { type: "beta" }
        ])

        const loaders = CreateTaskLoaders({ repositoriesData })

        assert.equal(loaders.alfa.tipo, "alfa")
        assert.deepEqual(carregados, ["alfa"])
    })

    it("a segunda consulta não repete o require", () => {
        const { repositoriesData, carregados } = _MountRepository([{ type: "alfa" }])

        const loaders = CreateTaskLoaders({ repositoriesData })

        const primeira = loaders.alfa
        const segunda  = loaders.alfa

        assert.equal(primeira, segunda)
        assert.deepEqual(carregados, ["alfa"])
    })

    it("a fábrica de um loader com injectsDeps recebe as runtimeDeps", () => {
        const { repositoriesData } = _MountRepository([{ type: "alfa", injectsDeps: true }])

        const loaders = CreateTaskLoaders({ repositoriesData })

        assert.equal(loaders.alfa.tipo, "alfa")
        assert.equal(typeof loaders.alfa.runtimeDeps.SmartRequire, "function")
        // O builder web é um getter: sem EcosystemCoreRepo instalado ele
        // responde undefined em vez de explodir.
        assert.equal(loaders.alfa.runtimeDeps.WebInterfaceBuilder, undefined)
    })

    it("um tipo não declarado continua undefined", () => {
        const { repositoriesData } = _MountRepository([{ type: "alfa" }])

        const loaders = CreateTaskLoaders({ repositoriesData })

        assert.equal(loaders.gama, undefined)
    })
})
