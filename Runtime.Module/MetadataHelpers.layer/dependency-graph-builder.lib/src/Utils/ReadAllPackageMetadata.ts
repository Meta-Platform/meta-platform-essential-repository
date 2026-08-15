import type { PackageMetadata } from "../../types/MetadataHierarchy"

const LoadMetadataDir = require("../../../../../Commons.Module/Libraries.layer/load-metatada-dir.lib/src/LoadMetadataDir") as (params: { path: string, metadataDirName: string }) => Promise<PackageMetadata | undefined>

const ReadAllPackageMetadata = async ({ path, PKG_CONF_DIRNAME_METADATA }: {
    path: string
    PKG_CONF_DIRNAME_METADATA: string
}): Promise<PackageMetadata | undefined> => {
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