/*
 * O log que chega por streaming vem de OUTRO processo (o package-executor da
 * instância supervisionada). Ele é reemitido no logger local com o mesmo nível
 * de origem: assim o que era só impressão de tela passa a ser também histórico.
 */
const LEVEL_BY_TYPE = { info : "info", success : "message", warning : "warn", error : "error", stdout : "message" }

const ConnectLogStreaming =  ({
    client,
    connectionTries=0
}) => new Promise(async (resolve, reject) => {
    try{
        /* Feedback de um comando interativo: vai para o humano, não é operacional. */
        Log.message("ConnectLogStreaming", `Verificando conexão com package-executor. Tentativa ${connectionTries}...`)

        const logStreaming = client.GetLogStreaming()
        logStreaming.on('data', (logResponse) => {
            resolve(logStreaming)
            Log[LEVEL_BY_TYPE[logResponse.type] || "info"](logResponse.sourceName, logResponse.message)
        })
        logStreaming.on('error', (error) => reject(error))
    }catch(e){
        reject(e)
    }
})

const TryConnectLogStreaming = ({
    client,
    ms,
    remainingConnectionAttempts,
    connectionTries=1
}) =>
    new Promise(async (resolve, reject) => {
        try{
            resolve(await ConnectLogStreaming({
                client, connectionTries
            }))
        }catch(e){
            if(e.code === 14){

                if(remainingConnectionAttempts-1 > 0){
                    setTimeout(async () => {
                        resolve(await TryConnectLogStreaming({
                            client,
                            ms,
                            remainingConnectionAttempts: remainingConnectionAttempts-1,
                            connectionTries: connectionTries+1
                        }))
                    }, ms)
                }

            } else {
                reject(e)
            }
        }
    })

module.exports = TryConnectLogStreaming
