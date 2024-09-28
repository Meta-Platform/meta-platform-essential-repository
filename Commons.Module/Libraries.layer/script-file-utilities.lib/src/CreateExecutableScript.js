const MakeFileExecutable = require("./MakeFileExecutable")
const CreateUtf8TextFile = require("./CreateUtf8TextFile")

const CreateExecutableScript = async (filePath, content, loggerEmitter) => {
    await CreateUtf8TextFile(filePath, content, loggerEmitter)
    await MakeFileExecutable(filePath, loggerEmitter)
}

module.exports = CreateExecutableScript