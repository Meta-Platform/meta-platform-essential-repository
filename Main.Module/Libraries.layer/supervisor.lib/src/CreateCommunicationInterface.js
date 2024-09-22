const SmartRequire = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")

const grpc = SmartRequire('@grpc/grpc-js')
const protoLoader = SmartRequire('@grpc/proto-loader')

const { resolve, join } = require("path")

const ConvertTaskResponseToTask = require("./ConvertTaskResponseToTask")

const ConvertTaskListResponsetoTaskList = (response) => {
    const {
        tasksList
    } = response

    return tasksList.map((response) => ConvertTaskResponseToTask(response))
}

const PROTO_PATH = join(__dirname, "..", "IDL", "PackageExecutorRPCSpec.proto")

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

const CreateCommunicationInterface = async (socketFilename) => {

    const socketFilePath = resolve(process.env.SUPERVISOR_SOCKETS_DIRPATH, socketFilename)

    const daemonClient = await CreateClient(socketFilePath)
    
    const Kill = () => daemonClient.Kill({}, () => {})

    const GetStatus = () => new Promise((resolve, reject) => {
        daemonClient.GetStatus({}, (err, executionStatusResponse) => {
            if (err) reject(err)
            else resolve(executionStatusResponse.status)
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
        daemonClient.GetTask({ taskId }, (err, taskResponse) => {
            if (err) reject(err)
            else {
                const taskInformation = ConvertTaskResponseToTask(taskResponse)
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
        GetTask
    }
    
}

module.exports = CreateCommunicationInterface