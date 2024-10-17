const colors = require("colors")
const SOURCES = require("../Configs/repository-sources.json")

const ListSourcesCommand = async () => {  

    console.log(`\n${colors.underline.bold("Lista de fontes de repositórios")}\n`)

    Object.entries(SOURCES)
    .forEach(([repositoryNamespace, sources]) => {
        
        console.log(`\t${colors.bold(repositoryNamespace)}`)
        sources.forEach((source) => {

            const { sourceType } = source

            const renderOutputInfo = sourceType === "LOCAL_FS"
             ? source.path
             : sourceType === "GITHUB_RELEASE"
                ? `${source.repositoryOwner}/${source.repositoryName}`
                : sourceType === "GOOGLE_DRIVE"
                    ? source.fileId
                    : ""

            console.log(`\t\t${colors.italic.inverse(` ${sourceType} `)} ${colors.dim(renderOutputInfo)}`)
        })

    })
    
}

module.exports = ListSourcesCommand