const BuildApplicationScriptContent = ({
    PACKAGE_REPO_PATH,
    SUPERVISOR_SOCKET_FILE_PATH,
    REPOSITORY_NAME
}) => `#!/bin/bash

PACKAGE_REPO_PATH="${PACKAGE_REPO_PATH}"
SUPERVISOR_SOCKET_PATH="${SUPERVISOR_SOCKET_FILE_PATH}"
REPOSITORY_NAME="${REPOSITORY_NAME}"

source execute-application "$@"
`

module.exports = BuildApplicationScriptContent