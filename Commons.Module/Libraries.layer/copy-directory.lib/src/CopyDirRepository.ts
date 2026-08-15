const CopyDirectoryTree = require("./CopyDirectoryTree") as (source: string, destination: string, excludedNames?: string[]) => void

/*
 * O que NÃO acompanha um repositório quando ele é implantado: o histórico do
 * git e as dependências npm. O primeiro é grande e não é do ecossistema; as
 * segundas são reinstaladas no diretório de dependências da execução.
 */
const EXCLUDED_FROM_REPOSITORY = [".git", "node_modules"]

/** Copia um repositório para o EcosystemData, sem `.git` nem `node_modules`. */
const CopyDirRepository = (source: string, destination: string): void =>
    CopyDirectoryTree(source, destination, EXCLUDED_FROM_REPOSITORY)

module.exports = CopyDirRepository
