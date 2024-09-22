const SmartRequire = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")
const Arborist = SmartRequire('@npmcli/arborist')

const { join } = require("path")

const InstallNpmPackage = async ({
    environmentPath, 
    packageName, 
    dependencies, 
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
}) => {
    const dependenciesForAdd = Object.keys(dependencies)
        .map((name) => {
            const version = dependencies[name]
            return `${name}@${version}`
        })

    const contextPath = join(environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES, packageName)
    const arborist = new Arborist({ path: contextPath, progress:true})
    await arborist.reify({add:dependenciesForAdd})
}

module.exports = InstallNpmPackage