const { watch } = require('node:fs/promises') as typeof import('node:fs/promises')

const ListSocketFilesName = require("./ListSocketFilesName") as (directoryPath: string) => Promise<string[]>

/**
 * Observa o diretório de sockets e reporta a lista a cada mudança.
 *
 * CONTRATO, e é onde já se tropeçou: a promessa devolvida NUNCA resolve com
 * sucesso — o `for await` só termina quando o watcher morre. Ela existe apenas
 * como canal de ERRO. Por isso não se faz `await` nela (travaria a partida de
 * quem chama para sempre) e MUITO menos se chama sem `.catch()`: `watch` falha
 * por motivo ambiental — EMFILE quando o teto de instâncias inotify da máquina
 * está estourado, ENOENT se o diretório sumir — e sem `catch` esse erro vira uma
 * UnhandledPromiseRejection no stderr, deixando quem chama convencido de que
 * está observando um diretório que ninguém mais observa.
 *
 * A forma correta de usar é `WatchSocketDirectory({...}).catch(handler)`, com um
 * handler que diga o que deixou de funcionar.
 */
const WatchSocketDirectory = async ({directoryPath, onChangeSocketFileList}: {
    directoryPath: string
    onChangeSocketFileList: (socketFileNames: string[]) => void
}): Promise<void> => {
    const watcher = watch(directoryPath)
    for await (const { eventType, filename } of watcher) {
        onChangeSocketFileList(await ListSocketFilesName(directoryPath))
    }
}

module.exports = WatchSocketDirectory
