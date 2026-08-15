const { mkdir } = require('node:fs/promises') as typeof import('node:fs/promises')
const { resolve } = require("path") as typeof import("path")

const SmartRequire = require("../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const VerifyDirExit = require("../Helpers/VerifyDirExit")

const RestoreDir = async ({
    installDataDirPath,
    dirname
}: {
    installDataDirPath: string
    dirname: string
}): Promise<void> => {

    const dirPath = resolve(installDataDirPath, dirname)

    if(!await VerifyDirExit(dirPath)){
        Log.warn("RestoreDir", `O diretório ${colors.bold(dirname)} não foi encontrado!`)
        await mkdir(dirPath)
        Log.warn("RestoreDir", `O subdiretório ${ colors.bold(dirname)} foi recriado!`)
    } else {
        Log.info("RestoreDir", `O diretório ${colors.bold(dirname)} já existe!`)
    }
}

module.exports = RestoreDir