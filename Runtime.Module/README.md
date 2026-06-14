[Meta Platform Essential Repository](../README.md)
# Runtime *Module*

Peças de **tempo de execução**: o executor de tarefas, os *task loaders*
(object loaders) e os utilitários de metadados que montam o plano de execução.

- **Executor** *Layer*
    - [**task-executor** *library*](./Executor.layer/task-executor.lib/README.md)
- **EssentialTaskLoaders** *Layer*
    - [**application-instance** *library*](./EssentialTaskLoaders.layer/application-instance.lib/README.md)
    - [**command-application** *library*](./EssentialTaskLoaders.layer/command-application.lib/README.md)
    - [**endpoint-instance** *library*](./EssentialTaskLoaders.layer/endpoint-instance.lib/README.md)
    - [**install-nodejs-package-dependencies** *library*](./EssentialTaskLoaders.layer/install-nodejs-package-dependencies.lib/README.md)
    - [**nodejs-package** *library*](./EssentialTaskLoaders.layer/nodejs-package.lib/README.md)
    - [**service-instance** *library*](./EssentialTaskLoaders.layer/service-instance.lib/README.md)
- **MetadataHelpers** *Layer*
    - [**dependency-graph-builder** *library*](./MetadataHelpers.layer/dependency-graph-builder.lib/README.md)
    - [**execution-params-generator** *library*](./MetadataHelpers.layer/execution-params-generator.lib/README.md)
    - [**metadata-hierarchy-handler** *library*](./MetadataHelpers.layer/metadata-hierarchy-handler.lib/README.md)
    - [**resolve-package-name** *library*](./MetadataHelpers.layer/resolve-package-name.lib/README.md)

> **Criar um novo task loader (object loader)?** Veja o
> [Guia: como criar e usar um Object Loader](./Executor.layer/task-executor.lib/docs/guia-criar-object-loader.md).
>
> Conceitos: [Tipos de Object Loader](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/concepts/tipos-de-object-loader.md)
> e [Execution Params Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/packages/execution-params-standard.md).
