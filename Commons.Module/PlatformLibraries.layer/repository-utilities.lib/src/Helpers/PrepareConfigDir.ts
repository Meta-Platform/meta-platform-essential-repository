/*
 * ATENÇÃO: `./CreateConfigDir` não existe neste pacote — requerer este módulo
 * lança na primeira linha. Ele é, portanto, código morto: nada o carrega hoje.
 * Convertido como está; remover é assunto do passo de simplificação.
 */
const VerifyConfigDir = require("./VerifyConfigDir") as (ref: ConfigDirRef) => Promise<boolean>
const CreateConfigDir = require("./CreateConfigDir") as (ref: ConfigDirRef) => Promise<void>

type ConfigDirRef = { ECO_DIRPATH_INSTALL_DATA: string }

const PrepareConfigDir = async ({ECO_DIRPATH_INSTALL_DATA}: ConfigDirRef): Promise<void> =>{
    const configDirExit = await VerifyConfigDir({ECO_DIRPATH_INSTALL_DATA})
    if(configDirExit){
        return
    } else {
        await CreateConfigDir({ECO_DIRPATH_INSTALL_DATA})
        await PrepareConfigDir({ECO_DIRPATH_INSTALL_DATA})
    }
}

module.exports = PrepareConfigDir