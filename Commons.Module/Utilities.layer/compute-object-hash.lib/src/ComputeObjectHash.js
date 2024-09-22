const crypto = require('crypto')

const ComputeObjectHash = (object) => {
    const objectJSONString = JSON.stringify(object)
    const hash = crypto.createHash('sha256')
    hash.update(objectJSONString)
    return hash.digest('hex')
}


module.exports = ComputeObjectHash