const { createHash } = require('crypto') as typeof import('crypto')

const ComputeObjectHash = (object: unknown): string => {
    const objectJSONString = JSON.stringify(object)
    const hash = createHash('sha256')
    hash.update(objectJSONString)
    return hash.digest('hex')
}


module.exports = ComputeObjectHash
