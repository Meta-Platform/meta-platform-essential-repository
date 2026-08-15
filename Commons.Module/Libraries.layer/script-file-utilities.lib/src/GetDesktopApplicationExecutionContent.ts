import type { BuildContentFunction, ExecutionContentParams } from "./Types"

const BuildExecutionScriptContent = require("./BuildExecutionScriptContent") as (params: ExecutionContentParams, specificFlags: string[]) => string

/*
 * Aplicação de desktop. Hoje sobe exatamente como uma aplicação de serviço — o
 * que difere um `.desktopapp` de um `.webapp` está no taskLoader, não aqui.
 * Existe como nome próprio porque é assim que o instalador fala, e porque o dia
 * em que a janela precisar de uma flag própria, ela terá onde entrar.
 */
const GetDesktopApplicationExecutionContent: BuildContentFunction = (params) =>
    BuildExecutionScriptContent(params, [
        `--verbose`,
        `--supervisorSocket "$SUPERVISOR_SOCKET_PATH"`
    ])

module.exports = GetDesktopApplicationExecutionContent
