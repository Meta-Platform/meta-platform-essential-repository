const RemoveExecutableScript = require("./RemoveExecutableScript")
const CreateExecutableScript = require("./CreateExecutableScript")

const RecreateExecutableScript = async (filePath, content) => {
    await RemoveExecutableScript(filePath)
    await CreateExecutableScript(filePath, content)
}

module.exports = RecreateExecutableScript