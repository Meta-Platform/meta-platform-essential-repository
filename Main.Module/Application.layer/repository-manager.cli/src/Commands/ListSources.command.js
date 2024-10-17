const colors = require("colors")
const SOURCES = require("../Configs/repository-sources.json")

const ListSourcesCommand = async () => {  
    Object.entries(SOURCES)
    .forEach(([repositoryNamespace, sources]) => {
        console.log("\n================================================================================")
        console.log(`\n  ${colors.bold(repositoryNamespace)} \n`)
        sources.forEach((source) => {
            console.log('  ----------------------------------------------------------------------------')  
            const paramsNameList = Object.keys(source)
            paramsNameList.forEach((paramName) => {
                const paramValueRender = paramName !== "sourceType" ? colors.dim(source[paramName]) : colors.bold(source[paramName])
                console.log(`   ${colors.italic(paramName)} ${colors.bold("->")} ${paramValueRender}`)
            })
        })
        console.log("\n================================================================================\n")
    })
}

module.exports = ListSourcesCommand