const ExtractMetadataFromMetadataByType = ({ type, dependency, dependencyMetadata }: { type: any, dependency: string, dependencyMetadata: any }) => {
    const [ _, __, metadataName,  _namespace] = dependency.split("/")
    const metadata = dependencyMetadata[metadataName]

    if(type === "services"){
        const serviceMetadata = metadata && metadata
            .find(({ namespace }: { namespace: string }) => namespace === _namespace)    
        return serviceMetadata
    }else {
        return metadata
    }
}

module.exports = ExtractMetadataFromMetadataByType