import type { CreateExecutableScriptFn, MakeFileExecutableFn, CreateUtf8TextFileFn } from "./Types"

const MakeFileExecutable = require("./MakeFileExecutable") as MakeFileExecutableFn
const CreateUtf8TextFile = require("./CreateUtf8TextFile") as CreateUtf8TextFileFn

const CreateExecutableScript: CreateExecutableScriptFn = async (filePath, content) => {
    await CreateUtf8TextFile(filePath, content)
    await MakeFileExecutable(filePath)
}

module.exports = CreateExecutableScript
