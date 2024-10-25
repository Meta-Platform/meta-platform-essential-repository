const LoadMetadataDir = require("../../../../../Commons.Module/Libraries.layer/load-metatada-dir.lib/src/LoadMetadataDir")

const ReadAllPackageMetadata = async ({ path, PKG_CONF_DIRNAME_METADATA }) => {
    try{
        return await LoadMetadataDir({
            path,
            metadataDirName: PKG_CONF_DIRNAME_METADATA,
        })
    }catch(e){
        return undefined
    }
}

module.exports = ReadAllPackageMetadata