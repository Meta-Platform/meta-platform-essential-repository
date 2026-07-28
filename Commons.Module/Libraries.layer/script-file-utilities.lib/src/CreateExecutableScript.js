const MakeFileExecutable = require("./MakeFileExecutable")
const CreateUtf8TextFile = require("./CreateUtf8TextFile")

const CreateExecutableScript = async (filePath, content) => {
    await CreateUtf8TextFile(filePath, content)
    await MakeFileExecutable(filePath)
}

module.exports = CreateExecutableScript