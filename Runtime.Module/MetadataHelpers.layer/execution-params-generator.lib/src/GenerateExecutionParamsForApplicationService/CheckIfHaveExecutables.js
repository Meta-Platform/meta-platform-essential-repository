const ExtractRootMetadata = require("./Commons/ExtractRootMetadata")

const CheckIfHaveExecutables = (metadataHierarchy) => {
    try{
        return !!ExtractRootMetadata(metadataHierarchy)?.boot?.executables?.length > 0
    }catch(e){
        return false
    }
}

module.exports = CheckIfHaveExecutables