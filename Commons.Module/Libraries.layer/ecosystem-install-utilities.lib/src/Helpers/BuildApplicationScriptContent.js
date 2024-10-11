const BuildApplicationScriptContent = ({
    PACKAGE_REPO_PATH,
    supervisorSocketFilePath,
    REPOSITORY_NAMESPACE
}) => `#!/bin/bash

PACKAGE_REPO_PATH="${PACKAGE_REPO_PATH}"
SUPERVISOR_SOCKET_PATH="${supervisorSocketFilePath}"
REPOSITORY_NAMESPACE="${REPOSITORY_NAMESPACE}"

source execute-application "$@"
`

module.exports = BuildApplicationScriptContent