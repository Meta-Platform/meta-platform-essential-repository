const ReadAllPackageMetadata = require("../Utils/ReadAllPackageMetadata")

const RetrieveAllPackageMetadata = ReadAllPackageMetadata

const ResolveDependencyPath = require("../ResolveDependencyPath")
const ResolveDependenciesPathsByBoundParams = require("./ResolveDependenciesPathsByBoundParams")

const HasEndpoints = ({ endpoints }) => Boolean(endpoints && endpoints.length > 0)
const HasServices = ({ services }) => Boolean(services && services.length > 0)
const HasBootConfiguration = ({ boot }) => Boolean(boot)

const isLocalNamespace = (namespace) => namespace && namespace.startsWith(LOCAL_NAMESPACE_PREFIX)

const isNotLocalDependency = ({ dependency }) => !isLocalNamespace(dependency)

const LOCAL_NAMESPACE_PREFIX = "@//"

const ConstructDependencyRawMetadataTreeRecursively = async ({
    path,
    packageList,
    REPOS_CONF_EXT_GROUP_DIR,
    PKG_CONF_DIRNAME_METADATA
}) => {
    
    const metadata = await RetrieveAllPackageMetadata({ path, PKG_CONF_DIRNAME_METADATA })
    const isBootAvailable = HasBootConfiguration(metadata)
    const bootHasServices = isBootAvailable && HasServices(metadata.boot)
    const bootHasEndpoints = isBootAvailable && HasEndpoints(metadata.boot)

    const _GetExternalDependecies = async (property) => (await Promise.all(
        metadata.boot[property]
        .filter(isNotLocalDependency)
        .map(async (metadataArg) => {
            const path = await ResolveDependencyPath({ 
                packageList,
                dependency:metadataArg.dependency, 
                REPOS_CONF_EXT_GROUP_DIR
            })
            
            const boundParamsPaths = await ResolveDependenciesPathsByBoundParams({
                packageList,
                boundParams: metadataArg["bound-params"],
                REPOS_CONF_EXT_GROUP_DIR
            })

            const boundParamsMetadata = await Promise.all(boundParamsPaths.map(path => ConstructDependencyRawMetadataTreeRecursively({
                path,
                packageList,
                REPOS_CONF_EXT_GROUP_DIR,
                PKG_CONF_DIRNAME_METADATA
            })))
            return [ 
                await ConstructDependencyRawMetadataTreeRecursively({
                    path,
                    packageList,
                    REPOS_CONF_EXT_GROUP_DIR,
                    PKG_CONF_DIRNAME_METADATA
                }), ...boundParamsMetadata
            ]
        })
        )).flatMap((arr) => arr)

    const children = [
        ...bootHasServices ? await _GetExternalDependecies("services") : [],
        ...bootHasEndpoints ? await _GetExternalDependecies("endpoints") : []
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
