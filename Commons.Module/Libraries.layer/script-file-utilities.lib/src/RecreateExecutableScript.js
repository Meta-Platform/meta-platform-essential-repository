const RemoveExecutableScript = require("./RemoveExecutableScript")
const CreateExecutableScript = require("./CreateExecutableScript")

const RecreateExecutableScript = async (filePath, content, loggerEmitter) => {
    await RemoveExecutableScript(filePath, loggerEmitter)
    await CreateExecutableScript(filePath, content, loggerEmitter)
}

module.exports = RecreateExecutableScript