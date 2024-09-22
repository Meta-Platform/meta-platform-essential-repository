const CreatePrintDataLog = require("./CreatePrintDataLog")

const ConnectLogStreaming =  ({
    loggerEmitter,
    client, 
    connectionTries=0
}) => new Promise(async (resolve, reject) => {
    try{
        loggerEmitter 
        && loggerEmitter.emit("log", {
            sourceName: "ConnectLogStreaming", 
            type:"info", 
            message: `Verificando conexão com package-executor. Tentativa ${connectionTries}...`
        })
        const PrintDataLog = await CreatePrintDataLog()

        const logStreaming = client.GetLogStreaming()
        logStreaming.on('data', (logResponse) => {
            resolve(logStreaming)
            PrintDataLog(logResponse)
        })
        logStreaming.on('error', (error) => reject(error))
    }catch(e){
        reject(e)
    }
})

const TryConnectLogStreaming = ({
    loggerEmitter,
    client, 
    ms, 
    remainingConnectionAttempts, 
    connectionTries=1
}) => 
    new Promise(async (resolve, reject) => {
        try{
            resolve(await ConnectLogStreaming({
                loggerEmitter, client, connectionTries
            }))
        }catch(e){
            if(e.code === 14){

                if(remainingConnectionAttempts-1 > 0){
                    setTimeout(async () => {
                        resolve(await TryConnectLogStreaming({
                            loggerEmitter,
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