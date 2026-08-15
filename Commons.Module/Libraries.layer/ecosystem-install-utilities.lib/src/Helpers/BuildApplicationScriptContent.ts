import type { ScriptContentParams } from "../Types"

const BuildApplicationScriptContent = ({
    PACKAGE_REPO_PATH,
    supervisorSocketFilePath,
    REPOSITORY_PATH,
    debugMode = false
}: ScriptContentParams): string => `#!/bin/bash

PACKAGE_REPO_PATH="${PACKAGE_REPO_PATH}"
SUPERVISOR_SOCKET_PATH="unix:${supervisorSocketFilePath}"
REPOSITORY_PATH="${REPOSITORY_PATH}"

source execute-application${debugMode ? "-dbg" : ""} "$@"
`

module.exports = BuildApplicationScriptContent