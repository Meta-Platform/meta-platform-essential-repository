import type { PackageEntry } from "../../../../Commons.Module/PlatformLibraries.layer/repository-utilities.lib/src/Types"

const ExtractNamespace = (dependency: string): string => {
    const [ namespace ] = dependency.replace("@/", "").split("/")
    return namespace 
}

const ResolveDependencyPath = async ({ 
    packageList,
    dependency, 
    REPOS_CONF_EXT_GROUP_DIR
}: {
    packageList: PackageEntry[]
    dependency: string
    REPOS_CONF_EXT_GROUP_DIR: string
}): Promise<string> => {

    const namespace = ExtractNamespace(dependency)
    try{
        const [ packageName, ext ] = namespace.replace("@", "").split(".")

        // `package` é palavra reservada; o nome muda, o valor é o mesmo.
        const foundPackage = packageList
        .find((pgkInf =>  pgkInf.packageName === packageName && pgkInf.ext === ext))

        const {
            layerPath,
            parentGroup
        } = foundPackage!
        
        return `${layerPath}/${parentGroup ? `${parentGroup}.${REPOS_CONF_EXT_GROUP_DIR}/`: ""}${packageName}.${ext}`
    }catch(e){
        const errorMessage = `namespace \x1b[1m${namespace}\x1b[0m não foi encontrado`
        const tipMessage = "\n\tDicas: cadastre o repo correspondente ao pacote não encontrado o \x1b[3m'myad repo register <REPO_NAMESPACE> <REPO_PATH>'\x1b[0m"
        throw errorMessage + tipMessage
    }
}

module.exports = ResolveDependencyPath