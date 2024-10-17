const colors = require("colors")
const SOURCES = require("../Configs/repository-sources.json")

const ListSourcesCommand = async () => {  
    Object.entries(SOURCES)
    .forEach(([repositoryNamespace, sources]) => {
        console.log("\n====================================================================================\n")
        console.log(`   ${colors.underline.bold(repositoryNamespace)}\n`)
        sources.forEach((source, index) => {
            const paramsNameList = Object.keys(source)
            paramsNameList.forEach((paramName) => {
                const paramValueRender = paramName !== "sourceType" ? colors.dim(source[paramName]) : colors.bold(source[paramName])
                console.log(`\t  ${colors.italic(paramName.padEnd(15))} ${colors.bold("->")} ${paramValueRender}`)
            })
            if(index < sources.length - 1){
                //console.log("\t-----------------")
                console.log("\t--------------------------------------------------------------------")
            }
        })
        console.log("\n====================================================================================\n\n")
    })
}

module.exports = ListSourcesCommand