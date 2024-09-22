const Arborist = require("@npmcli/arborist")

const InstallNodejsDependencies = async ({
    contextPath, 
    dependencies
}) => {
    const dependenciesForAdd = Object.keys(dependencies)
        .map((name) => {
            const version = dependencies[name]
            return `${name}@${version}`
        })
    const arborist = new Arborist({ path: contextPath, progress:true})
    await arborist.reify({add:dependenciesForAdd})
}

module.exports = InstallNodejsDependencies