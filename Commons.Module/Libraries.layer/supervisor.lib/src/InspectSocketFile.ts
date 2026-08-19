import type { SocketInspection, SocketConnectionProbe } from "./Types"

const fs   = require("node:fs/promises") as typeof import("node:fs/promises")
const net  = require("node:net") as typeof import("node:net")
const path = require("node:path") as typeof import("node:path")

/*
    QUEM É O DONO DESTE ARQUIVO DE SOCKET — e ele ainda existe?

    Um arquivo `.sock` é só um nome no sistema de arquivos: ele sobrevive ao
    processo que o criou. Quando a instância morre de forma abrupta (SIGKILL,
    queda da máquina, container derrubado), o arquivo fica, e todo mundo que
    olha o diretório continua achando que há uma instância ali.

    Este módulo NÃO decide se o arquivo deve ser apagado — apagar é destrutivo e
    a política de quem apaga mora em quem supervisiona. O que ele faz é reunir
    os fatos, cada um verificável de forma independente:

      1. o arquivo existe, é socket e tem esta idade;
      2. o kernel tem — ou não tem — alguém ESCUTANDO neste caminho
         (`/proc/net/unix`, coluna de flags com SO_ACCEPTCON e estado LISTENING);
      3. se tem, qual processo é o dono (inode do socket cruzado com
         `/proc/<pid>/fd`) e se esse processo está vivo;
      4. o que o kernel responde a uma conexão de teste.

    A diferença entre (2)/(4) e "não consegui falar com a instância" é o ponto
    inteiro: um serviço que está subindo, ou ocupado, ou reiniciando, não
    responde — mas continua com um listener registrado no kernel, e o
    `connect()` contra ele é ACEITO. `ECONNREFUSED` num socket unix é o kernel
    afirmando que o arquivo existe e NINGUÉM está ligado nele.
*/

const PROC_NET_UNIX_PATH = "/proc/net/unix"

/* SO_ACCEPTCON: o kernel marca com este bit o socket que chamou `listen()`. */
const FLAG_ACCEPT_CONNECTION = 0x10000
/* SS_UNCONNECTED, que para um socket com SO_ACCEPTCON significa "escutando". */
const STATE_LISTENING = 1

const DEFAULT_CONNECTION_PROBE_TIMEOUT_MS = 1000

type ProcNetUnixEntry = {
    socketInode : number
    listening   : boolean
    socketPath  : string
}

const _ParseProcNetUnix = (content: string): ProcNetUnixEntry[] =>
    content
    .split("\n")
    .slice(1) // a primeira linha é o cabeçalho
    .reduce((entries: ProcNetUnixEntry[], line: string) => {
        const fields = line.trim().split(/\s+/)
        // Num: RefCount Protocol Flags Type St Inode Path — sem Path a linha
        // é de um socket anônimo e não interessa a ninguém aqui.
        if(fields.length < 8) return entries
        const flags       = parseInt(fields[3], 16)
        const state       = parseInt(fields[5], 16)
        const socketInode = parseInt(fields[6], 10)
        const socketPath  = fields.slice(7).join(" ")
        // Sockets abstratos (nome começando por `@`) não têm arquivo e nunca
        // são o que este módulo inspeciona.
        if(socketPath.startsWith("@")) return entries
        entries.push({
            socketInode,
            listening : (flags & FLAG_ACCEPT_CONNECTION) !== 0 && state === STATE_LISTENING,
            socketPath
        })
        return entries
    }, [])

const _ReadProcNetUnix = async (): Promise<ProcNetUnixEntry[] | undefined> => {
    try {
        const content = await fs.readFile(PROC_NET_UNIX_PATH, "utf-8")
        return _ParseProcNetUnix(content)
    } catch(e) {
        // Plataforma sem `/proc` (ou sem permissão de leitura): o sinal fica
        // INDETERMINADO, que é diferente de "não há dono".
        return undefined
    }
}

const _IsPidDirectory = (name: string) => /^\d+$/.test(name)

/*
    Do inode do socket ao PID que o mantém aberto.

    Cada descritor aberto de um processo aparece em `/proc/<pid>/fd/<n>` como um
    link simbólico para `socket:[<inode>]`. Só se enxerga o que pertence ao
    próprio usuário — por isso NÃO achar o PID nunca é prova de que o dono
    morreu; é apenas ausência de evidência, e entra no relato como tal.
*/
const _FindListenerPid = async (socketInode: number): Promise<number | undefined> => {
    let pidNames: string[]
    try {
        pidNames = await fs.readdir("/proc")
    } catch(e) {
        return undefined
    }

    const alvo = `socket:[${socketInode}]`

    for(const pidName of pidNames.filter(_IsPidDirectory)){
        let fileDescriptors: string[]
        try {
            fileDescriptors = await fs.readdir(path.join("/proc", pidName, "fd"))
        } catch(e) {
            // Processo que terminou no meio da varredura, ou de outro usuário.
            continue
        }
        for(const fileDescriptor of fileDescriptors){
            try {
                const link = await fs.readlink(path.join("/proc", pidName, "fd", fileDescriptor))
                if(link === alvo) return parseInt(pidName, 10)
            } catch(e) { /* descritor fechado no meio do caminho */ }
        }
    }

    return undefined
}

const _IsProcessAlive = (pid: number): boolean => {
    try {
        // Sinal 0 não entrega nada: só pergunta ao kernel se o processo existe
        // e se temos permissão sobre ele.
        process.kill(pid, 0)
        return true
    } catch(e: any) {
        // EPERM significa que o processo EXISTE e é de outro usuário.
        return e && e.code === "EPERM"
    }
}

/*
    Conexão de teste. Deliberadamente crua — `net`, não gRPC: o que se quer
    saber é o veredito do KERNEL sobre a existência de um listener, não se a
    aplicação do outro lado sabe responder a um RPC.
*/
const ProbeSocketConnection = (socketFilePath: string, timeout = DEFAULT_CONNECTION_PROBE_TIMEOUT_MS): Promise<SocketConnectionProbe> =>
    new Promise((resolve) => {
        let resolvido = false
        const _Resolver = (resultado: SocketConnectionProbe) => {
            if(resolvido) return
            resolvido = true
            try { socket.destroy() } catch(e) { /* já caiu */ }
            resolve(resultado)
        }

        const socket = net.connect(socketFilePath)
        socket.setTimeout(timeout)
        socket.on("connect", () => _Resolver("ACCEPTED"))
        socket.on("timeout", () => _Resolver("INDETERMINATE"))
        socket.on("error", (err: any) => {
            if(err && err.code === "ECONNREFUSED") return _Resolver("REFUSED")
            if(err && err.code === "ENOENT")       return _Resolver("MISSING")
            // EACCES, EAGAIN e o resto do mundo: não sabemos, e não saber tem de
            // aparecer como não saber.
            _Resolver("INDETERMINATE")
        })
    })

const InspectSocketFile = async (socketFilePath: string, options?: { resolveListenerPid?: boolean, connectionProbeTimeout?: number }): Promise<SocketInspection> => {

    const resolveListenerPid     = options?.resolveListenerPid !== false
    const connectionProbeTimeout = options?.connectionProbeTimeout || DEFAULT_CONNECTION_PROBE_TIMEOUT_MS

    let stats
    try {
        stats = await fs.stat(socketFilePath)
    } catch(e) {
        return {
            socketFilePath,
            exists     : false,
            isSocket   : false,
            connection : "MISSING",
            evidence   : "o arquivo não existe"
        }
    }

    if(!stats.isSocket()){
        return {
            socketFilePath,
            exists     : true,
            isSocket   : false,
            fileInode  : stats.ino,
            connection : "INDETERMINATE",
            evidence   : "o caminho existe mas não é um socket"
        }
    }

    const ageMs = Math.max(0, Date.now() - stats.mtimeMs)

    const procNetUnixEntries = await _ReadProcNetUnix()

    const listenEntry = procNetUnixEntries
        ?.find(({ socketPath, listening }) => listening && socketPath === socketFilePath)

    const listening = procNetUnixEntries === undefined
        ? undefined
        : !!listenEntry

    const listenerPid = (listenEntry && resolveListenerPid)
        ? await _FindListenerPid(listenEntry.socketInode)
        : undefined

    const listenerAlive = listenerPid === undefined ? undefined : _IsProcessAlive(listenerPid)

    const connection = await ProbeSocketConnection(socketFilePath, connectionProbeTimeout)

    const evidence = [
        `idade ${Math.round(ageMs / 1000)}s`,
        listening === undefined ? "listener indeterminado (sem /proc/net/unix)"
            : listening         ? `listener registrado no kernel${listenerPid !== undefined ? ` (pid ${listenerPid}${listenerAlive ? ", vivo" : ", morto"})` : " (pid não identificado)"}`
                                : "nenhum listener registrado no kernel",
        `conexão de teste: ${connection}`
    ].join("; ")

    return {
        socketFilePath,
        exists      : true,
        isSocket    : true,
        fileInode   : stats.ino,
        ageMs,
        listening,
        socketInode : listenEntry?.socketInode,
        listenerPid,
        listenerAlive,
        connection,
        evidence
    }
}

module.exports = InspectSocketFile
module.exports.ProbeSocketConnection = ProbeSocketConnection
