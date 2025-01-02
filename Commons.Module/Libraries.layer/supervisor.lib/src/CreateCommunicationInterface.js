const path = require("path")

const SmartRequire = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")

const grpc = SmartRequire('@grpc/grpc-js')
const protoLoader = SmartRequire('@grpc/proto-loader')

const ConvertTaskResponseToTask = require("./ConvertTaskResponseToTask")

const ConvertTaskListResponsetoTaskList = (response) => {
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

const CreateClient = (socketFilePath) => 
    new PackageExecutorRPCService(`unix:${socketFilePath}`, grpc.credentials.createInsecure())

const WaitForConnectionReady = async (client, timeout = 5000) => {
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

const CreateCommunicationInterface = async (socketFilePath) => {
    const daemonClient = CreateClient(socketFilePath)

    try {
        await WaitForConnectionReady(daemonClient)
    } catch (err) {
        throw new Error("Failed to connect to daemon: " + err.message)
    }

    const Kill = () => new Promise((resolve, reject) => {
        daemonClient.Kill({}, (err, response) => {
            if (err) reject(err)
            else resolve(response.status)
        })
    })

    const GetStatus = () => new Promise((resolve, reject) => {
        daemonClient.GetStatus({}, (err, response) => {
            if (err) reject(err)
            else resolve(response.status)
        })
    })

    const GetStartupArguments = () => new Promise((resolve, reject) => {
        daemonClient.GetStartupArguments({}, (err, response) => {
            if (err) reject(err)
            else resolve(response)
        })
    })

    const GetProcessInformation = () => new Promise((resolve, reject) => {
        daemonClient.GetProcessInformation({}, (err, response) => {
            if (err) reject(err)
            else resolve(response)
        })
    })

    const ListTasks = () => new Promise((resolve, reject) => {      
        daemonClient.ListTasks({}, (err, response) => {
            if (err) reject(err)
            else {
                resolve(ConvertTaskListResponsetoTaskList(response))    }
        })
    })

    const GetTask = (taskId) => new Promise((resolve, reject) => {
        daemonClient.GetTask({ taskId }, (err, response) => {
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
        Kill,
        GetStatus,
        ListTasks,
        GetTask,
        GetStartupArguments,
        GetProcessInformation
    }
    
}

module.exports = CreateCommunicationInterface