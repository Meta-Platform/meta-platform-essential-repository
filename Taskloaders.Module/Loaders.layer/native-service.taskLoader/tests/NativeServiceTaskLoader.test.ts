const { describe, before, it } = require("node:test") as typeof import("node:test")
const assert = (require("node:assert") as typeof import("node:assert")).strict
const { join } = require("node:path") as typeof import("node:path")
const EventEmitter = require("node:events") as typeof import("node:events")

require("../../../../Commons.Module/Libraries.layer/logger.lib/src/InstallGlobalLogger")({
    origin: "native-service-task-loader-test",
    disableFileSink: true,
    consoleLevel: "error"
})

const TaskStatusTypes          = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/TaskStatusTypes")
const CommandChannelEventTypes = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/CommandChannelEventTypes")

const NativeServiceTaskLoader   = require("../src/NativeService.taskLoader")
const ReadNativeServiceManifest = require("../src/ReadNativeServiceManifest")
const ResolveBinaryForPlatform  = require("../src/ResolveBinaryForPlatform")

const FIXTURES        = join(__dirname, "fixtures")
const VALID_PACKAGE   = join(FIXTURES, "proxy-borda.nativeservice")
const ARM_ONLY        = join(FIXTURES, "so-arm.nativeservice")
const BROKEN_FIXTURES = join(FIXTURES, "broken")

// As fixtures declaram a matriz `linux-x64`/`linux-arm64`, que é a que a norma
// exemplifica. Fora do Linux não há artefato a resolver, e o teste de ativação
// deixa de fazer sentido — o de manifesto continua valendo em qualquer máquina.
const NAO_E_LINUX = process.platform !== "linux"

// Sobe o loader como o task executor faria: instancia, emite START_TASK e espera
// o primeiro status terminal (ACTIVE ou FAILURE).
const StartLoader = (packagePath: string) => new Promise<any>((resolveStart) => {
    const executorChannel = new EventEmitter()
    const statuses: any[] = []

    executorChannel.on(CommandChannelEventTypes.CHANGE_TASK_STATUS, (status: any, reason: any) => {
        statuses.push({ status, reason })
        if (status === TaskStatusTypes.ACTIVE || status === TaskStatusTypes.FAILURE)
            resolveStart({ getServiceObject, statuses, executorChannel })
    })

    const getServiceObject = NativeServiceTaskLoader({ path: packagePath }, executorChannel)
    executorChannel.emit(CommandChannelEventTypes.START_TASK)
})

const StartAndFail = async (fixtureName: string) => {
    const { statuses } = await StartLoader(join(BROKEN_FIXTURES, fixtureName))
    assert.equal(statuses.at(-1).status, TaskStatusTypes.FAILURE)
    return statuses.at(-1).reason
}

describe("native-service task loader — pacote válido", { skip: NAO_E_LINUX }, () => {

    let handle: any
    let statuses: any[]

    before(async () => {
        const started = await StartLoader(VALID_PACKAGE)
        statuses = started.statuses
        handle = started.getServiceObject()
    })

    it("ativa a task e entrega o handle", () => {
        assert.equal(statuses.at(-1).status, TaskStatusTypes.ACTIVE)
        assert.equal(handle.getAlias(), "@proxy-borda")
        assert.equal(handle.getAbiVersion(), 1)
    })

    it("resolve o artefato da plataforma corrente", () => {
        assert.equal(handle.getPlatformKey(), `${process.platform}-${process.arch}`)
        assert.ok(handle.getBinaryPath().startsWith(VALID_PACKAGE))
        assert.ok(handle.getBinaryPath().endsWith(".so"))
    })

    it("publica a matriz inteira, e não só o artefato desta máquina", () => {
        assert.deepEqual(Object.keys(handle.getBinaryMatrix()).sort(), ["linux-arm64", "linux-x64"])
    })

    it("publica os símbolos e as capacidades declaradas", () => {
        assert.deepEqual(handle.getSymbols(), ReadNativeServiceManifest.REQUIRED_SYMBOLS)
        assert.deepEqual(handle.getCapabilities().map((c: any) => c.name), ["unix-socket"])
        assert.match(handle.getCapabilities()[0].reason, /socket de domínio Unix/)
    })

    it("entrega um handle congelado", () => {
        assert.ok(Object.isFrozen(handle))
        // Fora do modo estrito, escrever num objeto congelado não lança: falha
        // em silêncio. É por isso que o teste olha o efeito, e não a exceção.
        handle.getAlias = () => "outro"
        assert.equal(handle.getAlias(), "@proxy-borda")
    })

    it("solta o handle ao parar a task", async () => {
        const { getServiceObject, executorChannel } = await StartLoader(VALID_PACKAGE)
        assert.ok(getServiceObject())
        executorChannel.emit(CommandChannelEventTypes.STOP_TASK)
        assert.equal(getServiceObject(), undefined)
    })
})

describe("native-service task loader — matriz de plataformas", () => {

    it("escolhe o artefato da combinação plataforma-arquitetura", () => {
        const manifest = ReadNativeServiceManifest(VALID_PACKAGE)
        const { platformKey, binaryPath } = ResolveBinaryForPlatform(manifest, "linux", "arm64")

        assert.equal(platformKey, "linux-arm64")
        assert.ok(binaryPath.endsWith(join("dist", "linux-arm64", "servico.so")))
    })

    // Faltar a combinação DESTA máquina não é erro de manifesto: o manifesto do
    // `so-arm` é válido, o pacote é que não foi compilado para cá.
    it("falha na ativação — não no manifesto — quando a plataforma não está na matriz", () => {
        const manifest = ReadNativeServiceManifest(ARM_ONLY)

        assert.equal(manifest.abiVersion, 2)
        assert.throws(
            () => ResolveBinaryForPlatform(manifest, "linux", "x64"),
            /Binário não encontrado para a plataforma linux-x64: o serviço @so-arm declara linux-arm64/
        )
    })
})

describe("native-service task loader — manifesto inválido", () => {

    it("falha com motivo quando não há manifesto", async () => {
        assert.match(await StartAndFail("sem-manifesto"), /sem metadata\/nativeservice\.json/)
    })

    it("exige `alias`", async () => {
        assert.match(await StartAndFail("sem-alias"), /`alias` é obrigatório/)
    })

    it("exige `abiVersion`", async () => {
        assert.match(await StartAndFail("sem-abi-version"), /`abiVersion` é obrigatório e deve ser um inteiro >= 1/)
    })

    // A ABI é versionada por um inteiro que incrementa a cada quebra de
    // contrato, não por uma string de versão: "1" não é 1.
    it("recusa `abiVersion` que não é inteiro", async () => {
        assert.match(await StartAndFail("abi-version-nao-inteira"), /`abiVersion` é obrigatório e deve ser um inteiro >= 1/)
    })

    it("exige `binary`", async () => {
        assert.match(await StartAndFail("sem-binary"), /`binary` é obrigatório/)
    })

    it("recusa `binary` sem nenhuma combinação declarada", async () => {
        assert.match(await StartAndFail("binary-vazio"), /`binary` deve declarar ao menos uma combinação/)
    })

    it("recusa artefato declarado por caminho absoluto", async () => {
        assert.match(await StartAndFail("binary-absoluto"), /`binary\.linux-x64` deve ser relativo à raiz do pacote/)
    })

    it("recusa artefato declarado que não existe no pacote", async () => {
        assert.match(await StartAndFail("binary-inexistente"), /`binary\.linux-x64` aponta para um arquivo que não existe/)
    })

    it("recusa chave de plataforma sem arquitetura", async () => {
        assert.match(
            await StartAndFail("binary-chave-sem-arquitetura"),
            /`binary\.linux` não tem o formato `plataforma-arquitetura`/
        )
    })

    it("exige `symbols`", async () => {
        assert.match(await StartAndFail("sem-symbols"), /`symbols` é obrigatório/)
    })

    // A mensagem diz QUAIS símbolos faltam: descobrir um por vez custaria uma
    // ativação por símbolo a quem está escrevendo o primeiro serviço.
    it("nomeia os símbolos obrigatórios que faltam", async () => {
        assert.match(
            await StartAndFail("symbols-incompletos"),
            /`symbols` não declara os símbolos obrigatórios: nativeservice_handle, nativeservice_shutdown/
        )
    })

    it("exige `capabilities`", async () => {
        assert.match(await StartAndFail("sem-capabilities"), /`capabilities` é obrigatório/)
    })

    // `capabilities` não é contenção — é admissão e auditoria. Uma capacidade
    // sem razão não serve ao único fim que o campo tem.
    it("exige a razão de cada capacidade", async () => {
        assert.match(
            await StartAndFail("capability-sem-reason"),
            /a capacidade `docker-socket` precisa de `reason`/
        )
    })
})
