// Tipos de endpoint atendidos pelo `endpoint-instance` do ecosystem-core.
// Qualquer outro tipo é resolvido como um objectLoaderType próprio, de modo que um
// repositório possa contribuir um tipo de endpoint — e as dependências npm que ele
// exigir — sem que o núcleo conheça a tecnologia envolvida.
const BUILTIN_ENDPOINT_TYPES = ["controller", "web-graphic-user-interface"]

const ConvertTypeTaskParamsToObjectLoaderType = (typeMetadata: any, endpointType: any) => {
    switch(typeMetadata){
        case "services":
            return "service-instance"
        case "endpoints":
            return !endpointType || BUILTIN_ENDPOINT_TYPES.includes(endpointType)
                ? "endpoint-instance"
                : endpointType
        case "windows":
                return "desktop-window-instance"
        default:
            return undefined
    }
}

ConvertTypeTaskParamsToObjectLoaderType.BUILTIN_ENDPOINT_TYPES = BUILTIN_ENDPOINT_TYPES

module.exports = ConvertTypeTaskParamsToObjectLoaderType
