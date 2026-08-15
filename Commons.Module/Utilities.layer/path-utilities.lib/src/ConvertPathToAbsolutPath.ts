const path = require("path") as typeof import("path")
const os = require('os') as typeof import('os')

/**
 * Resolve o `~` que se escreve nos metadados e nos perfis de instalação.
 *
 * Um caminho de configuração é escrito por gente — `~/EcosystemData` —, mas o
 * sistema de arquivos não conhece o `~`. Esta é a tradução, e ela precisa ser a
 * mesma em todo lugar: até aqui existiam cinco cópias deste cálculo pelo
 * repositório, e uma delas divergindo passaria despercebida até alguém instalar
 * o ecossistema no lugar errado.
 */
const ConvertPathToAbsolutPath = (_path: string): string => path
    .join(_path)
    .replace('~', os.homedir())

module.exports = ConvertPathToAbsolutPath
