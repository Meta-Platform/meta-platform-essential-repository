import type { BuildContentFunction } from "./Types"

const GetCommandLineApplicationExecutionContent: BuildContentFunction = ({
    RENDER_BINARY_DIR_PATH,
    RENDER_ECOSYSTEM_DATA_PATH,
    RENDER_PKG_CONF_DIRNAME_METADATA,
    RENDER_DIRNAME_MINIMAL_NODEJS_DEPENDENCIES,
    RENDER_DIRNAME_CONFIGURATIONS_DIR,
    debugMode=false
}) => 
`#!/bin/bash

ECOSYSTEM_DATA_PATH="${RENDER_ECOSYSTEM_DATA_PATH}"

ECOSYSTEM_DEFAULT="$ECOSYSTEM_DATA_PATH/${RENDER_DIRNAME_CONFIGURATIONS_DIR}/ecosystem-defaults.json"
NODEJS_DEPS_PATH="$ECOSYSTEM_DATA_PATH/${RENDER_DIRNAME_MINIMAL_NODEJS_DEPENDENCIES}"

PACKAGE_PATH="$REPOSITORY_PATH/$PACKAGE_REPO_PATH"
STARTUP_JSON="$REPOSITORY_PATH/$PACKAGE_REPO_PATH/${RENDER_PKG_CONF_DIRNAME_METADATA}/startup-params.json"

# O runtime do pkg injeta PKG_EXECPATH no ambiente e a propaga a processos filhos
# (inclusive quando o pai é um binário pkg, como o daemon executor-manager). Se o
# binário pkg abaixo herdar essa variável, ele age como "node puro" e trata a
# própria flag --package como script ("Cannot find module .../--package"),
# morrendo antes de subir. Limpamos aqui para o binário bootstrap-ar seu snapshot.
unset PKG_EXECPATH

${debugMode ? "pkg-exec-dbg" : `"${RENDER_BINARY_DIR_PATH}"`} --package "$PACKAGE_PATH" \
--startupJson "$STARTUP_JSON" \
--ecosystemDefault "$ECOSYSTEM_DEFAULT" \
--ecosystemData "$ECOSYSTEM_DATA_PATH" \
--nodejsProjectDependencies "$NODEJS_DEPS_PATH" \
--executableName "$EXEC_NAME" \
--supervisorSocket "$SUPERVISOR_SOCKET_PATH" \
--commandLineArgs "$ARGS_STRING"
`

module.exports = GetCommandLineApplicationExecutionContent
