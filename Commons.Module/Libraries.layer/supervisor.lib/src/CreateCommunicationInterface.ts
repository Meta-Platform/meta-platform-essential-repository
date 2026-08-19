import type { Task } from "../../../../Runtime.Module/Executor.layer/task-executor.lib/types/Task"
import type { CommunicationInterface, ConvertTaskResponseToTaskFn, TaskResponse } from "./Types"

const path = require("path") as typeof import("path")

const SmartRequire = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")

const grpc = SmartRequire('@grpc/grpc-js')
const protoLoader = SmartRequire('@grpc/proto-loader')

const ConvertTaskResponseToTask = require("./ConvertTaskResponseToTask") as ConvertTaskResponseToTaskFn

const ConvertTaskListResponsetoTaskList = (response: { tasksList: TaskResponse[] }): Task[] => {
    const {
        tasksList
    } = response

    return tasksList.map((response) => ConvertTaskResponseToTask(response))
}

const PROTO_PATH = path.join(__dirname, "..", "IDL", "PackageExecutorRPCSpec.proto")

const PackageExecutorRPCSDefinition = protoLoader.loadSync(PROTO_PATH, {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true,
})

const PackageExecutorGrpcObject = grpc
    .loadPackageDefinition(PackageExecutorRPCSDefinition)

const PackageExecutorRPCService = PackageExecutorGrpcObject.PackageExecutorRPCSpec.PackageExecutorRPCService

const CreateClient = (socketFilePath: string) =>
    new PackageExecutorRPCService(`unix:${socketFilePath}`, grpc.credentials.createInsecure())

/*
    O `timeout` PRECISA valer, e este parâmetro já existia sem nenhum uso.

    A cadeia `setTimeout(checkState, 100)` só termina em READY, TRANSIENT_FAILURE
    ou SHUTDOWN. Um canal que fica em IDLE ou CONNECTING — arquivo de socket que
    existe mas cujo dono não aceita mais conexão, ou par que aceita e não
    responde — nunca chega a nenhum dos três: a promessa não settla NUNCA, e
    quem espera por ela fica retendo o cliente, o canal e a própria promessa
    para sempre. Com prazo, esse caso vira uma falha comum, e a falha tem
    tratamento.
*/
const WaitForConnectionReady = async (client: any, timeout = 5000): Promise<void> => {
    return new Promise((resolve, reject) => {
        const channel = client.getChannel()
        const prazoFinal = Date.now() + timeout
        const checkState = () => {
            const state = channel.getConnectivityState(true)
            if (state === grpc.connectivityState.READY) {
                resolve()
            } else if (state === grpc.connectivityState.TRANSIENT_FAILURE || state === grpc.connectivityState.SHUTDOWN) {
                reject(new Error("Failed to connect: connectivity state is " + state))
            } else if (Date.now() >= prazoFinal) {
                reject(new Error(`Failed to connect: timeout de ${timeout}ms com o canal em estado ${state}`))
            } else {
                setTimeout(checkState, 100)
            }
        }
        checkState()
    })
}

/*
    QUEM ABRE O CANAL FECHA O CANAL — inclusive, e principalmente, no caminho de
    erro.

    Um cliente gRPC não é um objeto comum que o coletor recolhe quando ninguém
    mais o referencia: `new PackageExecutorRPCService(...)` cria um canal com
    resolver, load balancer, subcanal, rastro de channelz e temporizador de
    backoff, e o próprio grpc-js os mantém alcançáveis por seus timers enquanto
    o canal não for fechado. Soltar a variável não fecha nada.

    Isto custou caro: quando o `WaitForConnectionReady` acima falhava, o
    `daemonClient` era simplesmente abandonado. O supervisor de instâncias tenta
    reconectar a cada 4 s em CADA socket que não responde, e o diretório de
    sockets guarda arquivos de instâncias que já morreram — sete deles, na
    máquina onde isto foi medido. Sete canais imortais a cada 4 s são ~6.300 por
    hora; o `host-agent.app` crescia ~100 MiB/h EM REPOUSO por causa disso, e um
    heap snapshot com três minutos de processo já mostrava 299 `InternalChannel`
    vivos.

    Duas coisas mudam aqui: o caminho de erro fecha o que abriu, e a interface
    devolvida passa a expor `Close()`, sem o qual nem o caminho de sucesso tinha
    como devolver o canal — quem mantém cliente de vida longa precisa poder
    encerrá-lo ao trocar de cliente ou ao parar de monitorar.
*/
const FecharClienteEmSilencio = (client: any) => {
    try { client.close() } catch(e) { /* fechar o que já caiu não é erro */ }
}

const CreateCommunicationInterface = async (socketFilePath: string): Promise<CommunicationInterface> => {
    const daemonClient = CreateClient(socketFilePath)

    try {
        await WaitForConnectionReady(daemonClient)
    } catch (err: any) {
        FecharClienteEmSilencio(daemonClient)
        throw new Error("Failed to connect to daemon: " + err.message)
    }

    const KillInstance = () => new Promise<string>((resolve, reject) => {
        daemonClient.KillInstance({}, (err: any, response: any) => {
            if (err) reject(err)
            else resolve(response.status)
        })
    })

    const GetStatus = () => new Promise<string>((resolve, reject) => {
        daemonClient.GetStatus({}, (err: any, response: any) => {
            if (err) reject(err)
            else resolve(response.status)
        })
    })

    const GetStartupArguments = () => new Promise<any>((resolve, reject) => {
        daemonClient.GetStartupArguments({}, (err: any, response: any) => {
            if (err) reject(err)
            else resolve(response)
        })
    })

    const GetProcessInformation = () => new Promise<any>((resolve, reject) => {
        daemonClient.GetProcessInformation({}, (err: any, response: any) => {
            if (err) reject(err)
            else resolve(response)
        })
    })

    const ListTasks = () => new Promise<Task[]>((resolve, reject) => {
        daemonClient.ListTasks({}, (err: any, response: any) => {
            if (err) reject(err)
            else {
                resolve(ConvertTaskListResponsetoTaskList(response))    }
        })
    })

    const GetTask = (taskId: number) => new Promise<Task>((resolve, reject) => {
        daemonClient.GetTask({ taskId }, (err: any, response: any) => {
            if (err) reject(err)
            else {
                const taskInformation = ConvertTaskResponseToTask(response)
                resolve(taskInformation)}
        })
    })

    const GetEventChangeListener = () => daemonClient.StatusChangeNotification()

    const GetLogStreaming = () => daemonClient.LogStreaming()

    const Close = () => FecharClienteEmSilencio(daemonClient)

    return {
        Close,
        GetLogStreaming,
        GetEventChangeListener,
        KillInstance,
        GetStatus,
        ListTasks,
        GetTask,
        GetStartupArguments,
        GetProcessInformation
    }

}

module.exports = CreateCommunicationInterface
