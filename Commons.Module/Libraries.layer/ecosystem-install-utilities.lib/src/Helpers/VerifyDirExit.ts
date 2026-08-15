const DirectoryExists = require("../../../../../Commons.Module/Utilities.layer/path-utilities.lib/src/DirectoryExists") as (dirPath: string) => Promise<boolean>

const VerifyDirExit = async (dirpath: string): Promise<boolean> => DirectoryExists(dirpath)

module.exports = VerifyDirExit
