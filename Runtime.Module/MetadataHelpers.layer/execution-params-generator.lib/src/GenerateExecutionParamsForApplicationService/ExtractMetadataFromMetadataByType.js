const ExtractMetadataFromMetadataByType = ({ type, dependency, dependencyMetadata }) => {
    const [ _, __, metadataName,  _namespace] = dependency.split("/")
    const metadata = dependencyMetadata[metadataName]

    if(type === "services"){
        const serviceMetadata = metadata && metadata
            .find(({ namespace }) => namespace === _namespace)    
        return serviceMetadata
    }else {
        return metadata
    }
}

module.exports = ExtractMetadataFromMetadataByType