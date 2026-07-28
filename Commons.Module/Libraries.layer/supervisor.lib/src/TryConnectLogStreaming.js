const CreatePrintDataLog = require("./CreatePrintDataLog")

const ConnectLogStreaming =  ({
    client, 
    connectionTries=0
}) => new Promise(async (resolve, reject) => {
    try{
        Log.info("ConnectLogStreaming", `Verificando conexão com package-executor. Tentativa ${connectionTries}...`)
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