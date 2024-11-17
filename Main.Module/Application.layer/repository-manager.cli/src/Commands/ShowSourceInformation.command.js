const colors = require("colors")
const SOURCES = require("../Configs/repository-sources.json")

const ShowSourceInformationCommand = async () => {  
    Object.entries(SOURCES)
        .forEach(([repositoryNamespace, sources]) => {

            console.log(`${colors.underline.bold(repositoryNamespace)}`)

            sources.forEach((source, index) => {
                const paramsNameList = Object.keys(source)
                paramsNameList.forEach((paramName) => {

                    if(paramName === "sourceType" )
                        console.log(`   ${colors.bold(source[paramName])}`)

                    if(paramName !== "sourceType" )
                        console.log(`\t${colors.dim(paramName.padEnd(15))} -> ${colors.dim.italic(source[paramName])}`)

                })
            })
            console.log("")

        })
}

module.exports = ShowSourceInformationCommand