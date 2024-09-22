const ExtractNamespace = (dependency) => {
    const [ namespace ] = dependency.replace("@/", "").split("/")
    return namespace 
}

const ResolveDependencyPath = async ({ 
    packageList,
    dependency, 
    REPOS_CONF_EXT_GROUP_DIR
}) => {

    const namespace = ExtractNamespace(dependency)
    try{
        const [ packageName, ext ] = namespace.replace("@", "").split(".")

        const package = packageList
        .find((pgkInf =>  pgkInf.packageName === packageName && pgkInf.ext === ext))

        const {
            layerPath,
            parentGroup
        } = package
        
        return `${layerPath}/${parentGroup ? `${parentGroup}.${REPOS_CONF_EXT_GROUP_DIR}/`: ""}${packageName}.${ext}`
    }catch(e){
        const errorMessage = `namespace \x1b[1m${namespace}\x1b[0m não foi encontrado`
        const tipMessage = "\n\tDicas: cadastre o repo correspondente ao pacote não encontrado o \x1b[3m'myad repo register <REPO_NAMESPACE> <REPO_PATH>'\x1b[0m"
        throw errorMessage + tipMessage
    }
}

module.exports = ResolveDependencyPath