import type { CreateExecutableScriptFn, RemoveExecutableScriptFn } from "./Types"

const RemoveExecutableScript = require("./RemoveExecutableScript") as RemoveExecutableScriptFn
const CreateExecutableScript = require("./CreateExecutableScript") as CreateExecutableScriptFn

const RecreateExecutableScript: CreateExecutableScriptFn = async (filePath, content) => {
    await RemoveExecutableScript(filePath)
    await CreateExecutableScript(filePath, content)
}

module.exports = RecreateExecutableScript
