const ExtractRootMetadata = require("./Commons/ExtractRootMetadata")
const CreateServiceTaskParams = require("./CreateServiceTaskParams")
const CreateListEndpointTaskParams = require("./CreateListEndpointTaskParams")

const ConvertToProtoTasksParams = ({ typeMetadata, metadataHierarchy }) => {
    const { boot:bootMetadata } = ExtractRootMetadata(metadataHierarchy)
    const bootMetadataSelected = bootMetadata[typeMetadata]
    if(bootMetadataSelected){
        if(typeMetadata === "services"){
            const protoTasksParams = bootMetadataSelected.map(bootServiceMetadata => 
                CreateServiceTaskParams(({ 
                    typeMetadata,
                    bootServiceMetadata, 
                    metadataHierarchy 
                })))
            return protoTasksParams
        } else if(typeMetadata === "endpoints"){
            const protoTasksParams = bootMetadataSelected
                .reduce((protoTasksParamsAcc, bootEndpointGroupMetadata) => [
                    ...protoTasksParamsAcc,
                    ...CreateListEndpointTaskParams({ 
                            typeMetadata, 
                            bootEndpointGroupMetadata, 
                            metadataHierarchy 
                        })
                ], [])
            return protoTasksParams
        }
        return []        
    }
    return []
}

module.exports = ConvertToProtoTasksParams