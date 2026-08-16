# Essential Task Loaders Layer

Os *task loaders* (object loaders) essenciais que o [Task Executor](../Runtime.Module/Executor.layer/task-executor.lib/README.md) usa para instanciar as unidades de um plano de execução:

- [**application-instance** Task Loader](./Loaders.layer/application-instance.taskLoader/README.md)
- [**command-application** Task Loader](./Loaders.layer/command-application.taskLoader/README.md)
- [**install-nodejs-package-dependencies** Task Loader](./Loaders.layer/install-nodejs-package-dependencies.taskLoader/README.md)
- [**nodejs-package** Task Loader](./Loaders.layer/nodejs-package.taskLoader/README.md)
- [**service-instance** Task Loader](./Loaders.layer/service-instance.taskLoader/README.md)
- [**wasm-module** Task Loader](./Loaders.layer/wasm-module.taskLoader/README.md)

Os loaders de capacidade **web** (`endpoint-instance`, `ui-library`) vivem no
`EcosystemCoreRepo` e o de janela desktop (`desktop-window-instance`) no
`PlatformApplicationsRepo` — cada repositório declara os seus em
`metadata/taskloaders.json`, e o [registry](./Registry.layer/taskloader-registry.lib/README.md)
monta o mapa a partir do que estiver instalado.

> **Criar um novo task loader?** Veja o
> [Guia: como criar e usar um Object Loader](../Runtime.Module/Executor.layer/task-executor.lib/docs/guia-criar-object-loader.md).
