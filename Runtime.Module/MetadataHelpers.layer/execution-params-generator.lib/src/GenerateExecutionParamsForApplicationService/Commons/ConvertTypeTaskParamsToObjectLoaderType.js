const ConvertTypeTaskParamsToObjectLoaderType = (typeMetadata) => {
    switch(typeMetadata){
        case "services":
            return "service-instance"
        case "endpoints":
                return "endpoint-instance"
        default:
            return undefined
    }
}

module.exports = ConvertTypeTaskParamsToObjectLoaderType