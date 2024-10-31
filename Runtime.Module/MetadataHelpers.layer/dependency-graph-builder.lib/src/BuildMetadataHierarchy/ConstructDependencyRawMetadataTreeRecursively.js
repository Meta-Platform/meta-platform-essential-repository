const ReadAllPackageMetadata = require("../Utils/ReadAllPackageMetadata")

const RetrieveAllPackageMetadata = ReadAllPackageMetadata

const ResolveDependencyPath = require("../ResolveDependencyPath")
const ResolveDependenciesPathsByBoundParams = require("./ResolveDependenciesPathsByBoundParams")

const HasEndpoints   = ({ endpoints })   => Boolean(endpoints && endpoints.length > 0)
const HasServices    = ({ services })    => Boolean(services && services.length > 0)
const HasExecutables = ({ executables }) => Boolean(executables && executables.length > 0)

const HasBootConfiguration = ({ boot }) => Boolean(boot)

const isLocalNamespace = ({ dependency:namespace }) => namespace && namespace.startsWith(LOCAL_NAMESPACE_PREFIX)
const isNotLocalDependency = (itemMetadata) => !isLocalNamespace(itemMetadata)

const LOCAL_NAMESPACE_PREFIX = "@//"

const ConstructDependencyRawMetadataTreeRecursively = async ({
    path,
    packageList,
    REPOS_CONF_EXT_GROUP_DIR,
    PKG_CONF_DIRNAME_METADATA,
    rootNamespace
}) => {
    
    const metadata = await RetrieveAllPackageMetadata({ path, PKG_CONF_DIRNAME_METADATA })
    const isBootAvailable = HasBootConfiguration(metadata)

    const bootHasServices    = isBootAvailable && HasServices(metadata.boot)
    const bootHasEndpoints   = isBootAvailable && HasEndpoints(metadata.boot)
    const bootHasExecutables = isBootAvailable && HasExecutables(metadata.boot)

    const _GetLocalNamespace = () => metadata.package.namespace

    const _GetRootNamespace = () => 
        isBootAvailable && !rootNamespace
            ? _GetLocalNamespace() 
            : rootNamespace

    const _GetDependency = (itemMetadata) => 
        isNotLocalDependency(itemMetadata)
            ? itemMetadata.dependency
            : _GetRootNamespace()

    const _GetExternalDependecies = async (property) => (await Promise.all(
        metadata.boot[property]
        .map(async (bootItemMetadata) => {

            const dependency = _GetDependency(bootItemMetadata)

            const path = await ResolveDependencyPath({ 
                packageList,
                dependency, 
                REPOS_CONF_EXT_GROUP_DIR
            })
            
            const boundParamsPaths = await ResolveDependenciesPathsByBoundParams({
                packageList,
                boundParams: bootItemMetadata["bound-params"],
                REPOS_CONF_EXT_GROUP_DIR
            })

            const boundParamsMetadataPromises = boundParamsPaths.map(
                (path) => ConstructDependencyRawMetadataTreeRecursively({
                            path,
                            packageList,
                            REPOS_CONF_EXT_GROUP_DIR,
                            PKG_CONF_DIRNAME_METADATA,
                            rootNamespace: _GetRootNamespace()
                        })
            )

            const boundParamsMetadata = await Promise.all(boundParamsMetadataPromises)

            return [ 
                ...(!isBootAvailable) || isNotLocalDependency(bootItemMetadata)
                    ? [
                        await ConstructDependencyRawMetadataTreeRecursively({
                            path,
                            packageList,
                            REPOS_CONF_EXT_GROUP_DIR,
                            PKG_CONF_DIRNAME_METADATA,
                            rootNamespace: _GetRootNamespace()
                        })
                    ]
                    : [],
                ...boundParamsMetadata
            ]
        })
        )).flatMap((arr) => arr)

    const children = [
        ...bootHasServices    ? await _GetExternalDependecies("services")    : [],
        ...bootHasEndpoints   ? await _GetExternalDependecies("endpoints")   : [],
        ...bootHasExecutables ? await _GetExternalDependecies("executables") : []
    ]

    return {
        path,
        metadata,
        ...children.length > 0 
            ? { children }
            : {}
    }
}

module.exports = ConstructDependencyRawMetadataTreeRecursively
