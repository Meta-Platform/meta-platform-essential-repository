[Meta Platform Essential Repository](../README.md)
# Runtime *Module*

Peças de **tempo de execução**: o executor de tarefas e os utilitários de metadados
que montam o plano de execução. Os *task loaders* ficam no
[Taskloaders Module](../Taskloaders.Module/README.md).

- **Executor** *Layer*
    - [**task-executor** *library*](./Executor.layer/task-executor.lib/README.md)
- **MetadataHelpers** *Layer*
    - [**dependency-graph-builder** *library*](./MetadataHelpers.layer/dependency-graph-builder.lib/README.md)
    - [**execution-params-generator** *library*](./MetadataHelpers.layer/execution-params-generator.lib/README.md)
    - [**metadata-hierarchy-handler** *library*](./MetadataHelpers.layer/metadata-hierarchy-handler.lib/README.md)
    - [**resolve-package-name** *library*](./MetadataHelpers.layer/resolve-package-name.lib/README.md)
    - [**resource-params-handler** *library*](./MetadataHelpers.layer/resource-params-handler.lib/README.md)

> **Criar um novo task loader (object loader)?** Veja o
> [Guia: como criar e usar um Object Loader](./Executor.layer/task-executor.lib/docs/guia-criar-object-loader.md).
>
> Conceitos: [Tipos de Object Loader](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/concepts/tipos-de-object-loader.md)
> e [Execution Params Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/packages/execution-params-standard.md).
