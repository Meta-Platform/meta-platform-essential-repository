import type { BuildContentFunction, ExecutionContentParams } from "./Types"

const BuildExecutionScriptContent = require("./BuildExecutionScriptContent") as (params: ExecutionContentParams, specificFlags: string[]) => string

/** Aplicação de serviço: sobe supervisionada e fala pelo log do ecossistema. */
const GetApplicationExecutionContent: BuildContentFunction = (params) =>
    BuildExecutionScriptContent(params, [
        `--verbose`,
        `--supervisorSocket "$SUPERVISOR_SOCKET_PATH"`
    ])

module.exports = GetApplicationExecutionContent
