const BuildCommandLineApplicationScriptContent = ({
    PACKAGE_REPO_PATH,
    EXEC_NAME,
    supervisorSocketFilePath,
    REPOSITORY_NAMESPACE
}) => `#!/bin/bash

PACKAGE_REPO_PATH="${PACKAGE_REPO_PATH}"
EXEC_NAME="${EXEC_NAME}"
SUPERVISOR_SOCKET_PATH="${supervisorSocketFilePath}"
REPOSITORY_NAMESPACE="${REPOSITORY_NAMESPACE}"

source execute-command-line-application "$@"
`

module.exports = BuildCommandLineApplicationScriptContent