const { describe, it } = require("node:test") as typeof import("node:test")
const assert = (require("node:assert") as typeof import("node:assert")).strict
const fs     = require("node:fs") as typeof import("node:fs")
const os     = require("node:os") as typeof import("node:os")
const path   = require("node:path") as typeof import("node:path")

const InstallNpmPackage = require("../src/InstallNpmPackage")

globalThis.Log = globalThis.Log || { info: () => {}, error: () => {}, warn: () => {}, message: () => {} }

const { IsAlreadySatisfied, WriteInstalledManifest } = InstallNpmPackage

// Monta um diretório de dependências como o arborist o deixaria: os pacotes
// declarados presentes em node_modules e o manifesto do que foi pedido.
const _MountContext = async ({ dependenciesForAdd, overrides, instalados }: {
    dependenciesForAdd: string[]
    overrides?: any
    instalados?: string[]
}) => {
    const contextPath = fs.mkdtempSync(path.join(os.tmpdir(), "inpm-"))

    for(const nome of instalados ?? [])
        fs.mkdirSync(path.join(contextPath, "node_modules", nome), { recursive: true })

    await WriteInstalledManifest({ contextPath, dependenciesForAdd, overrides })

    return contextPath
}

describe("InstallNpmPackage — quando a instalação pode ser dispensada", () => {

    // O ganho de memória depende deste caso ser o NORMAL num container: as
    // dependências chegam na imagem, e é isso que mantém o @npmcli/arborist (o
    // npm inteiro, 35 MiB) fora do heap de um processo que vive dias.
    it("dispensa quando o pedido é o mesmo e os pacotes estão no disco", async () => {
        const dependenciesForAdd = ["react@^19.1.0", "@npmcli/arborist@^8.0.1"]
        const contextPath = await _MountContext({
            dependenciesForAdd,
            instalados: ["react", "@npmcli/arborist"]
        })

        assert.equal(IsAlreadySatisfied({ contextPath, dependenciesForAdd, overrides: undefined }), true)
    })

    it("reinstala quando uma versão pedida mudou", async () => {
        const contextPath = await _MountContext({
            dependenciesForAdd: ["react@^19.1.0"],
            instalados: ["react"]
        })

        assert.equal(
            IsAlreadySatisfied({ contextPath, dependenciesForAdd: ["react@^19.2.0"], overrides: undefined }),
            false
        )
    })

    it("reinstala quando entrou uma dependência nova", async () => {
        const contextPath = await _MountContext({
            dependenciesForAdd: ["react@^19.1.0"],
            instalados: ["react"]
        })

        assert.equal(
            IsAlreadySatisfied({ contextPath, dependenciesForAdd: ["react@^19.1.0", "axios@^1.0.0"], overrides: undefined }),
            false
        )
    })

    it("reinstala quando um override mudou", async () => {
        const dependenciesForAdd = ["react@^19.1.0"]
        const contextPath = await _MountContext({
            dependenciesForAdd,
            overrides: { react: "19.1.0" },
            instalados: ["react"]
        })

        assert.equal(
            IsAlreadySatisfied({ contextPath, dependenciesForAdd, overrides: { react: "19.2.0" } }),
            false
        )
    })

    // O manifesto certo com o disco vazio é a armadilha: acreditar nele
    // entregaria um serviço que morre em "Cannot find module" no primeiro
    // require, longe daqui.
    it("reinstala quando o manifesto confere mas o pacote sumiu do disco", async () => {
        const dependenciesForAdd = ["react@^19.1.0", "axios@^1.0.0"]
        const contextPath = await _MountContext({
            dependenciesForAdd,
            instalados: ["react"]
        })

        assert.equal(IsAlreadySatisfied({ contextPath, dependenciesForAdd, overrides: undefined }), false)
    })

    it("sem manifesto, instala — é o primeiro boot", () => {
        const contextPath = fs.mkdtempSync(path.join(os.tmpdir(), "inpm-vazio-"))

        assert.equal(
            IsAlreadySatisfied({ contextPath, dependenciesForAdd: ["react@^19.1.0"], overrides: undefined }),
            false
        )
    })

    it("META_FORCE_NPM_REIFY desliga o atalho", async () => {
        const dependenciesForAdd = ["react@^19.1.0"]
        const contextPath = await _MountContext({ dependenciesForAdd, instalados: ["react"] })

        process.env.META_FORCE_NPM_REIFY = "1"
        try {
            assert.equal(IsAlreadySatisfied({ contextPath, dependenciesForAdd, overrides: undefined }), false)
        } finally {
            delete process.env.META_FORCE_NPM_REIFY
        }
    })
})
