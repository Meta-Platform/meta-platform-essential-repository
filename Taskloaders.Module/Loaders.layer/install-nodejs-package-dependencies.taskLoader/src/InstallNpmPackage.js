const SmartRequire = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")
const Arborist = SmartRequire('@npmcli/arborist')

const { join } = require("path")
const { writeFile } = require("fs/promises")

// O diretório de instalação começa vazio e o arborist recebe as dependências por
// `add`. Sem um package.json ali, não há onde declarar `overrides` — e sem
// `overrides` o npm não tem como resolver um conflito de peer transitivo.
//
// O caso que obrigou isto: styled-components 6 declara peer OPCIONAL em
// react-native, que exige react 19. Enquanto o consumidor declarava react 18, ele
// ancorava a resolução. Ao mover o react para a biblioteca de UI, o npm passou a
// escalar pelo react-native e a instalação falhava com ERESOLVE — produzindo
// ZERO módulos, em silêncio.
const WriteResolutionManifest = async ({ contextPath, packageName, overrides }) => {
    if(!overrides || Object.keys(overrides).length === 0) return
    const manifest = {
        name: `${packageName}-dependencies`,
        version: "0.0.0",
        private: true,
        overrides
    }
    await writeFile(join(contextPath, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8")
}

const InstallNpmPackage = async ({
    environmentPath,
    packageName,
    dependencies,
    overrides,
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
}) => {
    const dependenciesForAdd = Object.keys(dependencies)
        .map((name) => {
            const version = dependencies[name]
            return `${name}@${version}`
        })

    const contextPath = join(environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES, packageName)
    await WriteResolutionManifest({ contextPath, packageName, overrides })
    const arborist = new Arborist({ path: contextPath, progress:true})
    await arborist.reify({add:dependenciesForAdd})
}

module.exports = InstallNpmPackage