const path = require("path")
const fs = require("fs").promises

const INSTALLATION_PROFILES_DIRPATH = path.resolve(__dirname, "../InstallationProfiles")

const ListProfilesCommand = async () => {
    console.log("\x1b[35m%s\x1b[0m", "Meta Platform Setup Wizard")
    try {
        const files = await fs.readdir(INSTALLATION_PROFILES_DIRPATH)
        const jsonFiles = files.filter(file => file.endsWith('.json'))

        if (jsonFiles.length > 0) {
            console.log("\x1b[32m%s\x1b[0m", "Perfis de instalação disponíveis:")
            jsonFiles.forEach(file => {
                const displayName = file.replace('.install.json', '')
                console.log("\x1b[34m%s\x1b[0m", displayName)
            })
        } else {
            console.log("\x1b[31m%s\x1b[0m", "Não foram encontrados perfis de instalação no diretório especificado.")
        }

        return jsonFiles
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error("\x1b[31m%s\x1b[0m", "Erro: O diretório de perfis de instalação não foi encontrado.")
        } else {
            console.error("\x1b[31m%s\x1b[0m", "Erro ao ler o diretório:", error.message)
        }
        return []
    }
}

module.exports = ListProfilesCommand
