const { join } = require("path")
const fs = require("fs")

// Descoberta dinâmica de object loaders (Fase 2).
//
// Varre os repositórios instalados (repositories.json), lê o metadata/taskloaders.json
// de cada um e monta o mapa { objectLoaderType -> função-loader } que o TaskExecutor
// consome. Substitui os mapas hard-coded do pkg-exec, do package-runner.cli e do
// task-executor-machine.service.
//
// Cada entrada do taskloaders.json declara:
//   - objectLoaderType : a chave usada no execution-params (ex.: "desktop-window-instance")
//   - path             : caminho do package do loader, relativo à raiz do repositório
//   - entry            : módulo de entrada dentro do package (ex.: "src/Xxx.taskLoader")
//
// Sem fallback: se um repositório instalado não tiver repository.json/taskloaders.json,
// ele simplesmente não contribui loaders (fase de desenvolvimento — ver MPTL-12).
const CreateTaskLoaders = ({ repositoriesData }) => {

    const taskLoaders = {}

    for (const repositoryNamespace of Object.keys(repositoriesData)) {

        const { installationPath } = repositoriesData[repositoryNamespace]
        const taskLoadersFilePath = join(installationPath, "metadata", "taskloaders.json")

        if (!fs.existsSync(taskLoadersFilePath))
            continue

        const { taskLoaders: declaredTaskLoaders = [] } =
            JSON.parse(fs.readFileSync(taskLoadersFilePath, { encoding: "utf8" }))

        for (const declaredTaskLoader of declaredTaskLoaders) {
            const { objectLoaderType, path: packagePath, entry } = declaredTaskLoader
            const loaderModulePath = join(installationPath, packagePath, entry)
            taskLoaders[objectLoaderType] = require(loaderModulePath)
        }
    }

    return taskLoaders
}

module.exports = CreateTaskLoaders
