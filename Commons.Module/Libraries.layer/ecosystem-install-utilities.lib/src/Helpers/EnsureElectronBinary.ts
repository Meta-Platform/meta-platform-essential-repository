import type { RetryOptions } from "../../../download-file.lib/src/RunWithRetry"

const fs = require("fs") as typeof import("fs")
const path = require("path") as typeof import("path")
const { spawn } = require("child_process") as typeof import("child_process")

const { RunWithRetry } = require("../../../download-file.lib/src/RunWithRetry") as {
    RunWithRetry: <T>(operation: (attempt: number) => Promise<T>, options?: RetryOptions) => Promise<T>
}

/*
 * O binário do Electron (~120 MB) NÃO vem mais junto do pacote npm.
 *
 * Até o Electron 41, instalar o pacote `electron` baixava o binário como efeito
 * do `postinstall`, e o `reify` acima resolvia tudo. O Electron 42 removeu esse
 * `postinstall`: o download passou para dentro do `require("electron")`, na
 * PRIMEIRA vez que alguém pede o módulo — isto é, no primeiro lançamento de uma
 * janela, dentro de um `spawnSync` bloqueante, sem barra de progresso e sem
 * ninguém para reportar a falha.
 *
 * Pior: quem lança a janela é um binário `pkg`, e ali esse `spawnSync` só
 * funciona por um efeito colateral do runtime do pkg — ele injeta `PKG_EXECPATH`
 * no ambiente do filho, que é justamente a variável que os wrappers `execute-*`
 * dão `unset` de propósito (ver o comentário em `BuildExecutionScriptContent`).
 * Depender desse efeito para provisionar 120 MB é depender de um acidente.
 *
 * Por isso o download é PUXADO para o provisionamento: aqui há terminal, log e
 * retry, e o binário está garantidamente em disco antes da primeira janela.
 */

// Tempo de sobra para 120 MB em rede ruim, e ainda assim um teto: sem ele um
// download travado prenderia o provisionamento para sempre.
const INSTALL_TIMEOUT_MS = 900000
const INSTALL_ATTEMPTS = 3

/*
 * Onde arranjar um "node" para rodar o `install.js`.
 *
 * Mesma ordem de prioridade do `ResolveWorkerRuntime` do build de webgui, pelo
 * mesmo motivo: `spawn`, nunca `fork` — `fork` assume que `execPath` é node, o
 * que é falso sob binário empacotado.
 */
const _ResolveNodeRuntime = (): { command: string, env: NodeJS.ProcessEnv } => {

    // O Electron sabe virar node puro. Caso do provisionamento disparado de
    // dentro de uma janela (GUI-host).
    if(process.versions && process.versions.electron)
        return { command: process.execPath, env: { ELECTRON_RUN_AS_NODE: "1" } }

    // Binário empacotado: o próprio binário roda um script arbitrário como node
    // quando `PKG_EXECPATH` aponta para ele mesmo (prelude do @yao-pkg/pkg). É o
    // mesmo mecanismo do acidente descrito acima — a diferença é que aqui a
    // variável é DECLARADA, e o prelude respeita um valor explícito em vez de
    // injetar o seu (`if (opts.env.PKG_EXECPATH !== undefined) return`).
    if((process as any).pkg || (process.versions as any).pkg)
        return { command: process.execPath, env: { PKG_EXECPATH: process.execPath } }

    // Node puro.
    return { command: process.execPath, env: {} }
}

/*
 * A mesma pergunta que o `isInstalled()` do próprio `install.js` faz: a versão
 * desempacotada em `dist/` é a do pacote, e o executável apontado por `path.txt`
 * existe. Fazê-la aqui evita nascer um processo a cada `repo update` — o caso
 * comum é o binário já estar em disco.
 *
 * O `install.js` continua sendo a autoridade: ele refaz esta verificação e sai
 * com 0 se nada houver a fazer. Esta é uma antecipação barata, não um substituto.
 */
const _IsBinaryInstalled = (electronDirPath: string): boolean => {
    try {
        const { version } = JSON.parse(fs.readFileSync(path.join(electronDirPath, "package.json"), { encoding: "utf8" }))

        const unpackedVersion = fs.readFileSync(path.join(electronDirPath, "dist", "version"), { encoding: "utf8" })
        if(unpackedVersion.trim().replace(/^v/, "") !== version) return false

        const executableName = fs.readFileSync(path.join(electronDirPath, "path.txt"), { encoding: "utf8" }).trim()
        if(!executableName) return false

        const distPath = process.env.ELECTRON_OVERRIDE_DIST_PATH || path.join(electronDirPath, "dist")

        return fs.existsSync(path.join(distPath, executableName))
    } catch(error) {
        // Arquivo ausente é a resposta "não instalado", não uma falha.
        return false
    }
}

const _RunInstallScript = (electronDirPath: string): Promise<void> =>
    new Promise((resolve, reject) => {

        const runtime = _ResolveNodeRuntime()
        const scriptPath = path.join(electronDirPath, "install.js")

        const child = spawn(runtime.command, [scriptPath], {
            cwd: electronDirPath,
            env: { ...process.env, ...runtime.env },
            // Canalizado, nunca herdado: a saída do download tem de ir para o
            // log do provisionamento, e a última linha de erro precisa sobrar
            // para compor a mensagem da falha.
            stdio: ["ignore", "pipe", "pipe"]
        })

        let isSettled = false
        const errorOutput: string[] = []

        const finish = (error?: Error) => {
            if(isSettled) return
            isSettled = true
            clearTimeout(timer)
            error ? reject(error) : resolve()
        }

        const timer = setTimeout(() => {
            try { child.kill("SIGKILL") } catch(e) { /* já morreu */ }
            finish(new Error(`o download do binário do Electron excedeu ${Math.round(INSTALL_TIMEOUT_MS / 1000)}s e foi interrompido`))
        }, INSTALL_TIMEOUT_MS)

        const _Pipe = (stream: NodeJS.ReadableStream | null, level: "info" | "warn") => {
            if(!stream) return
            stream.setEncoding("utf8")
            stream.on("data", (chunk) => {
                for (const line of String(chunk).split(/[\r\n]+/)) {
                    const text = line.trim()
                    if(!text) continue
                    if(level === "warn") errorOutput.push(text)
                    Log[level]("EnsureElectronBinary", text)
                }
            })
        }
        _Pipe(child.stdout, "info")
        _Pipe(child.stderr, "warn")

        child.on("error", (error) => finish(error))

        child.on("close", (code, signal) => {
            if(code === 0) return finish()
            const tail = errorOutput.slice(-3).join(" | ") || "sem saída de erro"
            finish(new Error(`install.js do Electron terminou com código ${code}${signal ? ` (sinal ${signal})` : ""}: ${tail}`))
        })
    })

/*
 * Chamada logo depois do `reify`, e SÓ quando o pacote `electron` está entre as
 * dependências sincronizadas — um ecossistema sem nenhum `.desktopapp` não
 * declara o task loader `desktop-window-instance` e não deve pagar 120 MB.
 *
 * A falha NÃO aborta o provisionamento: `repo update`/`repo install` mexem em
 * todos os repositórios, e derrubar a atualização inteira porque a rede negou um
 * artefato do GitHub deixaria a máquina sem conseguir atualizar nem o que não
 * depende de Electron. O que ela não pode é passar em silêncio — daí o
 * `Log.error` com a causa e o comando de reparo manual. Sem o binário, o
 * comportamento volta a ser o de hoje: a tentativa preguiçosa na primeira janela.
 */
const EnsureElectronBinary = async ({ contextPath }: { contextPath: string }): Promise<void> => {

    const electronDirPath = path.join(contextPath, "node_modules", "electron")

    if(!fs.existsSync(path.join(electronDirPath, "install.js"))){
        Log.error("EnsureElectronBinary",
            `O pacote electron foi sincronizado mas ${electronDirPath} não tem install.js: o binário não pode ser garantido.`)
        return
    }

    if(_IsBinaryInstalled(electronDirPath)){
        Log.debug("EnsureElectronBinary", `Binário do Electron já presente em ${electronDirPath}.`)
        return
    }

    Log.warn("EnsureElectronBinary",
        "Baixando o binário do Electron (~120 MB). O download deixou de acontecer na instalação do pacote npm e é feito aqui, uma vez.")

    try {
        await RunWithRetry(() => _RunInstallScript(electronDirPath), {
            attempts: INSTALL_ATTEMPTS,
            label: "download do binário do Electron"
        })
    } catch(error) {
        Log.error("EnsureElectronBinary",
            "O binário do Electron NÃO foi baixado. As aplicações .desktopapp vão tentar baixá-lo sozinhas na primeira janela — e podem falhar sem aviso. " +
            `Para resolver manualmente: cd ${electronDirPath} && node install.js`, error)
        return
    }

    if(!_IsBinaryInstalled(electronDirPath)){
        Log.error("EnsureElectronBinary",
            `O install.js do Electron terminou sem erro, mas o binário continua ausente em ${electronDirPath}.`)
        return
    }

    Log.info("EnsureElectronBinary", `Binário do Electron pronto em ${electronDirPath}.`)
}

module.exports = EnsureElectronBinary
