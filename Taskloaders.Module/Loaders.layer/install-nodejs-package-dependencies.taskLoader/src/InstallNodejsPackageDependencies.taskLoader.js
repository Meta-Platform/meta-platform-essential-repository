const EventEmitter = require('node:events')

const LEVEL_BY_TYPE = { info : "info", success : "message", warning : "warn", error : "error" }


const TaskStatusTypes          = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/TaskStatusTypes")
const CommandChannelEventTypes = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/CommandChannelEventTypes")

const InstallNpmPackage = require("./InstallNpmPackage")
const ReadPackageJsonFile = require("./ReadPackageJsonFile")
const PreparePackageDependenciesDir = require("./PreparePackageDependenciesDir")

const ResolvePackageName = require("../../../../Runtime.Module/MetadataHelpers.layer/resolve-package-name.lib/src/ResolvePackageName")

const GetDependenciesFromPackageJsonFile = async (packagePath) => {
    const { dependencies } = await ReadPackageJsonFile(packagePath)
    return dependencies
}


module.exports = InstallNodejsPackageDependenciesTaskLoader 