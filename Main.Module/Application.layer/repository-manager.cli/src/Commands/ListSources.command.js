const colors = require("colors")
const SOURCES = require("../Configs/repository-sources.json")

const ListSourcesCommand = async () => {
    let count = 1
    Object.entries(SOURCES)
    .forEach(([repositoryNamespace, sources]) => {
        sources.forEach((source) => {
            console.log(`\t${count++}. ${colors.bold(repositoryNamespace.padEnd(15))} ${colors.bold("->")} ${source["sourceType"]}`) 
        })  
    })
}

module.exports = ListSourcesCommand