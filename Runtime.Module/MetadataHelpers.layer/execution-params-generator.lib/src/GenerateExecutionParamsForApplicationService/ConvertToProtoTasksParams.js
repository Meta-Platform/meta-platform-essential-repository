const ExtractRootMetadata = require("./Commons/ExtractRootMetadata")
const CreateServiceTaskParams = require("./CreateServiceTaskParams")
const CreateListEndpointTaskParams = require("./CreateListEndpointTaskParams")
const CreateWindowTaskParams = require("./CreateWindowTaskParams")

const ConvertToProtoTasksParams = ({ typeMetadata, metadataHierarchy }) => {
    const { boot:bootMetadata } = ExtractRootMetadata(metadataHierarchy)
    const bootMetadataSelected = bootMetadata[typeMetadata]
    if(bootMetadataSelected){
        if(typeMetadata === "services"){
            const protoTasksParams = bootMetadataSelected
                .map(itemMetadata => 
                    CreateServiceTaskParams({ 
                        typeMetadata,
                        itemMetadata, 
                        metadataHierarchy 
                    }))
            return protoTasksParams
        } else if(typeMetadata === "endpoints"){
            const protoTasksParams = bootMetadataSelected
                .reduce((protoTasksParamsAcc, itemMetadata) => [
                    ...protoTasksParamsAcc,
                    ...CreateListEndpointTaskParams({
                            typeMetadata,
                            itemMetadata,
                            metadataHierarchy
                        })
                ], [])
            return protoTasksParams
        } else if(typeMetadata === "windows"){
            const protoTasksParams = bootMetadataSelected
                .map(itemMetadata =>
                    CreateWindowTaskParams({
                        typeMetadata,
                        itemMetadata,
                        metadataHierarchy
                    }))
            return protoTasksParams
        }
        return []
    }
    return []
}

module.exports = ConvertToProtoTasksParams