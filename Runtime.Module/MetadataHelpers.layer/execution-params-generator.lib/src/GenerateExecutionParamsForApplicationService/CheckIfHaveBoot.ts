import type { MetadataHierarchy } from "../../../dependency-graph-builder.lib/types/MetadataHierarchy"

const ExtractRootMetadata = require("./Commons/ExtractRootMetadata")

const CheckIfHaveBoot = (metadataHierarchy: MetadataHierarchy) => {
    try{
        return !!ExtractRootMetadata(metadataHierarchy).boot
    }catch(e){
        return false
    }
}

module.exports = CheckIfHaveBoot