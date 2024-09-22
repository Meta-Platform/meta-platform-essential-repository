const BuildCommandLineApplicationScriptContent = ({
    PACKAGE_REPO_PATH,
    EXEC_NAME,
    SUPERVISOR_SOCKET_FILE_PATH,
    REPOSITORY_NAME
}) => `#!/bin/bash

PACKAGE_REPO_PATH="${PACKAGE_REPO_PATH}"
EXEC_NAME="${EXEC_NAME}"
SUPERVISOR_SOCKET_PATH="${SUPERVISOR_SOCKET_FILE_PATH}"
REPOSITORY_NAME="${REPOSITORY_NAME}"

source execute-command-line-application "$@"
`

module.exports = BuildCommandLineApplicationScriptContent