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

source execute-command-line-application${debugMode ? "-dbg" : ""} "$@"
`

module.exports = BuildCommandLineApplicationScriptContent