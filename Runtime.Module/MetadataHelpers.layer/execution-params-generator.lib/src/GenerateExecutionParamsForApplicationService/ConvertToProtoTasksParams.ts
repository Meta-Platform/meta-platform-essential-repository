import type { MetadataHierarchy } from "../../../dependency-graph-builder.lib/types/MetadataHierarchy"

const ExtractRootMetadata = require("./Commons/ExtractRootMetadata")
const CreateServiceTaskParams = require("./CreateServiceTaskParams")
const CreateListEndpointTaskParams = require("./CreateListEndpointTaskParams")
const CreateWindowTaskParams = require("./CreateWindowTaskParams")

const ConvertToProtoTasksParams = ({ typeMetadata, metadataHierarchy }: { typeMetadata: any, metadataHierarchy: MetadataHierarchy }) => {
    const { boot:bootMetadata } = ExtractRootMetadata(metadataHierarchy)
    const bootMetadataSelected = bootMetadata[typeMetadata]
    if(bootMetadataSelected){
        if(typeMetadata === "services"){
            const protoTasksParams = bootMetadataSelected
                .map((itemMetadata: any) => 
                    CreateServiceTaskParams({ 
                        typeMetadata,
                        itemMetadata, 
                        metadataHierarchy 
                    }))
            return protoTasksParams
        } else if(typeMetadata === "endpoints"){
            const protoTasksParams = bootMetadataSelected
                .reduce((protoTasksParamsAcc: any, itemMetadata: any) => [
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
                .map((itemMetadata: any) =>
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