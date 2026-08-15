import type { ResolvedResource } from "./Types"

const fs = require("fs") as typeof import("fs")

// Materializa em disco o que os pacotes declararam. Roda ANTES da execução: um
// pacote que abre um socket ou um SQLite não pode ser o responsável por criar a
// pasta onde ele mora — se fosse, cada pacote teria a sua própria versão do
// "garante o diretório", e o ecossistema não saberia dizer onde as coisas estão.
//
// Só o DONO materializa. Quem apenas referencia o recurso de outro pacote não
// cria nada: o cliente de um servidor que não está no ar deve falhar ao conectar,
// não fazer nascer um diretório vazio que parece um servidor instalado.
const EnsureResources = (resources?: ResolvedResource[]): string[] => {

    const created = (resources || [])
        .filter(({ owner }) => owner)
        .filter(({ dirPath }) => dirPath)
        .map(({ dirPath }) => dirPath)

    // Set: vários params costumam dividir a mesma pasta de namespace.
    Array.from(new Set(created))
        .forEach((dirPath) => fs.mkdirSync(dirPath, { recursive: true }))

    return created
}

module.exports = EnsureResources
