import type { BuildContentFunction, ExecutionContentParams } from "./Types"

const BuildExecutionScriptContent = require("./BuildExecutionScriptContent") as (params: ExecutionContentParams, specificFlags: string[]) => string

/*
 * Aplicação de linha de comando. Duas flags a mais: o nome do executável, para
 * o executor saber qual comando do package subir, e os argumentos — que viajam
 * como UMA string, já aspeados pelo wrapper, e que o TokenizeArgs desfaz do
 * outro lado.
 */
const GetCommandLineApplicationExecutionContent: BuildContentFunction = (params) =>
    BuildExecutionScriptContent(params, [
        `--executableName "$EXEC_NAME"`,
        `--supervisorSocket "$SUPERVISOR_SOCKET_PATH"`,
        `--commandLineArgs "$ARGS_STRING"`
    ])

module.exports = GetCommandLineApplicationExecutionContent
