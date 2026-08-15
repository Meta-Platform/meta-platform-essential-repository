import type { PackageMetadata } from "../../types/MetadataHierarchy"
import type { PackageEntry } from "../../../../../Commons.Module/PlatformLibraries.layer/repository-utilities.lib/src/Types"

/** Item do boot.json que pode apontar para outro package. */
type BootItem = { dependency?: string, [field: string]: any }

const ReadAllPackageMetadata = require("../Utils/ReadAllPackageMetadata") as (params: { path: string, PKG_CONF_DIRNAME_METADATA: string }) => Promise<PackageMetadata | undefined>

const RetrieveAllPackageMetadata = ReadAllPackageMetadata

const ResolveDependencyPath = require("../ResolveDependencyPath") as (params: any) => Promise<string>
const ResolveDependenciesPathsByBoundParams = require("./ResolveDependenciesPathsByBoundParams") as (params: any) => Promise<string[]>

const HasEndpoints   = ({ endpoints }: any)   => Boolean(endpoints && endpoints.length > 0)
const HasServices    = ({ services }: any)    => Boolean(services && services.length > 0)
const HasExecutables = ({ executables }: any) => Boolean(executables && executables.length > 0)
const HasWindows     = ({ windows }: any)     => Boolean(windows && windows.length > 0)

const HasBootConfiguration = ({ boot }: PackageMetadata) => Boolean(boot)

const isLocalNamespace = ({ dependency:namespace }: BootItem) => namespace && namespace.startsWith(LOCAL_NAMESPACE_PREFIX)
const isNotLocalDependency = (itemMetadata: BootItem) => !isLocalNamespace(itemMetadata)

const LOCAL_NAMESPACE_PREFIX = "@//"

const ConstructDependencyRawMetadataTreeRecursively = async ({
    path,
    packageList,
    REPOS_CONF_EXT_GROUP_DIR,
    PKG_CONF_DIRNAME_METADATA,
    rootNamespace
}: {
    path: string
    packageList: PackageEntry[]
    REPOS_CONF_EXT_GROUP_DIR: string
    PKG_CONF_DIRNAME_METADATA: string
    rootNamespace?: string
}): Promise<any> => {
    
    const metadata = await RetrieveAllPackageMetadata({ path, PKG_CONF_DIRNAME_METADATA })

    if(!metadata) throw `Não foi encontrado metadata no pacote de caminho "${path}"`

    const isBootAvailable = HasBootConfiguration(metadata)

    const bootHasServices    = isBootAvailable && HasServices(metadata.boot)
    const bootHasEndpoints   = isBootAvailable && HasEndpoints(metadata.boot)
    const bootHasExecutables = isBootAvailable && HasExecutables(metadata.boot)
    const bootHasWindows     = isBootAvailable && HasWindows(metadata.boot)

    const _GetLocalNamespace = () => metadata!.package!.namespace

    const _GetRootNamespace = () => 
        isBootAvailable && !rootNamespace
            ? _GetLocalNamespace() 
            : rootNamespace

    const _GetDependency = (itemMetadata: BootItem) => 
        isNotLocalDependency(itemMetadata)
            ? itemMetadata.dependency
            : _GetRootNamespace()

    const _GetExternalDependecies = async (property: string) => (await Promise.all(
        metadata!.boot![property]
        .map(async (bootItemMetadata: BootItem) => {

            const dependency = _GetDependency(bootItemMetadata)

            // Itens sem dependência (ex.: janelas .desktopapp com conteúdo local)
            // não puxam outro package para a hierarquia.
            if(!dependency) return []

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
        ...bootHasExecutables ? await _GetExternalDependecies("executables") : [],
        ...bootHasWindows     ? await _GetExternalDependecies("windows")     : []
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
