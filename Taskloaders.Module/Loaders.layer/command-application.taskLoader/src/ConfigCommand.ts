import type { CommandLoaderParams, CommandMetadata, CommandModule, CommandParameter } from "./Types"

/**
 * Traduz UM comando do `command-group.json` no módulo que o yargs entende.
 *
 * Recursivo por natureza: um comando com `children` monta os filhos pelo mesmo
 * caminho, e é por isso que a montagem mora num arquivo só — o loader que a usa
 * não precisa saber nada disso.
 */

const FilteredCommandParams = (loaderParams: CommandLoaderParams, parameterNames: string[] = []) =>
    parameterNames
    .reduce((serviceParamsAcc: Record<string, any>, parameterName: string) => ({
        ...serviceParamsAcc,
        [parameterName]: loaderParams[parameterName]
    }), {})

const BuildParameter = (yargsInstance: any, param: CommandParameter) => {
    const { key, paramType, valueType, describe } = param
    yargsInstance[paramType](key, { describe, type: valueType })
}

const GetCommandBuilder = ({ parameters, children, loaderParams }: {
    parameters?: CommandParameter[]
    children?: CommandMetadata[]
    loaderParams: CommandLoaderParams
}) =>
    async (yargsInstance: any) => {

        parameters?.forEach((param) => BuildParameter(yargsInstance, param))

        if(children){
            for(const childCommandData of children){
                const childCommandModule = await ConfigCommand({
                    commandMetadata: childCommandData,
                    loaderParams
                })
                yargsInstance.command(childCommandModule)
            }
        }
    }

/*
 * O handler carrega o módulo do comando pelo handle do package e lhe entrega
 * três coisas: os argumentos da linha, os startup-params e apenas os
 * bound-params que aquele comando declarou querer (`parametersToLoad`).
 */
const GetCommandHandler = ({
    path,
    parametersToLoad = [],
    loaderParams
}: {
    path?: string
    parametersToLoad?: string[]
    loaderParams: CommandLoaderParams
}) => {

    if (!path) return (args: any) => {}

    const { startupParams, nodejsPackageHandler, commandParameterNames } = loaderParams

    const CommandFunction = nodejsPackageHandler.require(path)
    const allParams = FilteredCommandParams(loaderParams, commandParameterNames)
    const params = FilteredCommandParams(allParams as CommandLoaderParams, parametersToLoad)

    return CommandFunction
        ? async (args: any) => await CommandFunction({ args, startupParams, params })
        : (args: any) => {}
}

const ConfigCommand = async ({
    commandMetadata,
    loaderParams
}: {
    commandMetadata: CommandMetadata
    loaderParams: CommandLoaderParams
}): Promise<CommandModule> => {

    const {
        path,
        command,
        parameters,
        children,
        description = '',
        parametersToLoad
    } = commandMetadata

    if (!command) {
        throw new Error('O campo "command" é obrigatório.')
    }

    return {
        command,
        describe: description,
        builder: GetCommandBuilder({ parameters, children, loaderParams }),
        handler: GetCommandHandler({ path, parametersToLoad, loaderParams })
    }
}

module.exports = ConfigCommand
