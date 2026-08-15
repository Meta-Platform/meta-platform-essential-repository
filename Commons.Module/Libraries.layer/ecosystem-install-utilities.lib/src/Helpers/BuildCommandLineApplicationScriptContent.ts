import type { ScriptContentParams } from "../Types"

const BuildCommandLineApplicationScriptContent = ({
    PACKAGE_REPO_PATH,
    EXEC_NAME,
    supervisorSocketFilePath,
    REPOSITORY_PATH,
    debugMode = false
}: ScriptContentParams & { EXEC_NAME: string }): string => `#!/bin/bash

PACKAGE_REPO_PATH="${PACKAGE_REPO_PATH}"
EXEC_NAME="${EXEC_NAME}"
SUPERVISOR_SOCKET_PATH="unix:${supervisorSocketFilePath}"
REPOSITORY_PATH="${REPOSITORY_PATH}"

# Os argumentos viajam até o pkg-exec como UMA string (--commandLineArgs), então
# cada um precisa ir aspeado — senão um valor com espaço vira dois argumentos.
# Escapamos \\ e " e envolvemos em aspas duplas: é exatamente o formato que o
# TokenizeArgs do command-application.taskLoader desfaz do outro lado.
QUOTED_ARGS=()
for arg in "$@"; do
    escaped=\${arg//\\\\/\\\\\\\\}
    escaped=\${escaped//\\"/\\\\\\"}
    QUOTED_ARGS+=("\\"\$escaped\\"")
done

ARGS_STRING="\${QUOTED_ARGS[*]}"

source execute-command-line-application${debugMode ? "-dbg" : ""} "$@"
`

module.exports = BuildCommandLineApplicationScriptContent