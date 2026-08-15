/**
 * Contratos do command-application.taskLoader — o loader que transforma o
 * `command-group.json` de um `.cli` numa aplicação de linha de comando.
 */

/** Um parâmetro declarado por um comando no metadado. */
export type CommandParameter = {
    key: string
    /** Como o yargs deve registrá-lo: `option`, `positional`… */
    paramType: string
    valueType: string
    describe?: string
}

/** Um comando, como está no `command-group.json`. */
export type CommandMetadata = {
    command: string
    commandName?: string
    description?: string
    /** Caminho do módulo que implementa o comando, dentro do `src` do package. */
    path?: string
    parameters?: CommandParameter[]
    children?: CommandMetadata[]
    /** Nomes dos bound-params que este comando recebe. */
    parametersToLoad?: string[]
    isMainCommand?: boolean
    /** Comando que NÃO encerra as demais tarefas ao terminar. */
    isNotStopAllTasks?: boolean
}

/**
 * O que o executor entrega ao loader: os comandos declarados, os argumentos da
 * linha, o handle do package e os bound-params já resolvidos.
 */
export type CommandLoaderParams = {
    commands: CommandMetadata[]
    commandLineArgs: string
    nodejsPackageHandler: { require: (srcPath: string) => any }
    startupParams?: Record<string, any>
    commandParameterNames?: string[]
    environmentPath?: string
    [boundParam: string]: any
}

/** Um comando no formato que o yargs consome. */
export type CommandModule = {
    command: string
    describe: string
    builder: (yargsInstance: any) => Promise<void>
    handler: (args: any) => Promise<any> | any
}
