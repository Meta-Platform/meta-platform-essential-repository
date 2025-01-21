const BuildApplicationScriptContent = ({
    PACKAGE_REPO_PATH,
    supervisorSocketFilePath,
    REPOSITORY_PATH
}) => `#!/bin/bash

PACKAGE_REPO_PATH="${PACKAGE_REPO_PATH}"
SUPERVISOR_SOCKET_PATH="${supervisorSocketFilePath}"
REPOSITORY_PATH="${REPOSITORY_PATH}"

source execute-application "$@"
`

module.exports = BuildApplicationScriptContent