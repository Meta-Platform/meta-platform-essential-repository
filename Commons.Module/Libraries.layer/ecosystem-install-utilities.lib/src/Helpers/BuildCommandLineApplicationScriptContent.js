const BuildCommandLineApplicationScriptContent = ({
    PACKAGE_REPO_PATH,
    EXEC_NAME,
    supervisorSocketFilePath,
    REPOSITORY_PATH,
    debugMode = false
}) => `#!/bin/bash

PACKAGE_REPO_PATH="${PACKAGE_REPO_PATH}"
EXEC_NAME="${EXEC_NAME}"
SUPERVISOR_SOCKET_PATH="unix:${supervisorSocketFilePath}"
REPOSITORY_PATH="${REPOSITORY_PATH}"

QUOTED_ARGS=()
for arg in "$@"; do
    # Se o argumento contém espaços, adiciona aspas
    if [[ "$arg" =~ [[:space:]] ]]; then
        QUOTED_ARGS+=("\"$arg\"")
    else
        QUOTED_ARGS+=("$arg")
    fi
done

ARGS_STRING="\${QUOTED_ARGS[@]}"

source execute-command-line-application${debugMode ? "-dbg" : ""} "$@"
`

module.exports = BuildCommandLineApplicationScriptContent