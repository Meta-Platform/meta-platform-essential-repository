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

const WaitForConnectionReady = async (client: any, timeout = 5000): Promise<void> => {
    return new Promise((resolve, reject) => {
        const channel = client.getChannel()
        const checkState = () => {
            const state = channel.getConnectivityState(true)
            if (state === grpc.connectivityState.READY) {
                resolve()
            } else if (state === grpc.connectivityState.TRANSIENT_FAILURE || state === grpc.connectivityState.SHUTDOWN) {
                reject(new Error("Failed to connect: connectivity state is " + state))
            } else {
                setTimeout(checkState, 100)
            }
        }
        checkState()
    })
}

const CreateCommunicationInterface = async (socketFilePath: string): Promise<CommunicationInterface> => {
    const daemonClient = CreateClient(socketFilePath)

    try {
        await WaitForConnectionReady(daemonClient)
    } catch (err: any) {
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

    return {
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
