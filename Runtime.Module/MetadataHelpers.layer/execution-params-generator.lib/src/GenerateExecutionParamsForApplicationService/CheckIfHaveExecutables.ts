import type { MetadataHierarchy } from "../../../dependency-graph-builder.lib/types/MetadataHierarchy"

const ExtractRootMetadata = require("./Commons/ExtractRootMetadata")

const CheckIfHaveExecutables = (metadataHierarchy: MetadataHierarchy) => {
    try{
        return !!ExtractRootMetadata(metadataHierarchy)?.boot?.executables?.length
    }catch(e){
        return false
    }
}

module.exports = CheckIfHaveExecutables