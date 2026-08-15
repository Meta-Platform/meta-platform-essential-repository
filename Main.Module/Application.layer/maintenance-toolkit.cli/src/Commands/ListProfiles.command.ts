const LoadAllInstalationProfiles = require("../Helpers/LoadAllInstalationProfiles")

/*
 * As cores vinham de `console.log("\x1b[35m%s\x1b[0m", texto)`. O `Log` não faz
 * substituição de `%s`, então o código de cor passa a envolver o texto direto —
 * mesma saída, sem depender do formatador do console.
 */
const Colorir = (codigo: any, texto: any) => `\x1b[${codigo}m${texto}\x1b[0m`

const ListProfilesCommand = async () => {
    Log.message("ListProfiles", Colorir(35, "Meta Platform Setup Wizard"))
    const installationProfiles = LoadAllInstalationProfiles()
    const profileNameList = Object.keys(installationProfiles)
    Log.message("ListProfiles", Colorir(32, "Perfis de instalação disponíveis:"))
    profileNameList.forEach((profile: string) => Log.message("ListProfiles", Colorir(34, profile)))
}

module.exports = ListProfilesCommand
