const ExtractRootMetadata = require("./Commons/ExtractRootMetadata")

const CheckIfHaveBoot = (metadataHierarchy) => {
    try{
        return !!ExtractRootMetadata(metadataHierarchy).boot
    }catch(e){
        return false
    }
}

module.exports = CheckIfHaveBoot