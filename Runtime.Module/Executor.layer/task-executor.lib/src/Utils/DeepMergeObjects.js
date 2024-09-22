const DeepMergeObjects = (obj1, obj2) => {
    const result = { ...obj1 }

    if (obj2) {
        Object.keys(obj2).forEach(key => {
            if (obj2[key] instanceof Object && key in result) {
                result[key] = DeepMergeObjects(result[key], obj2[key])
            } else {
                result[key] = obj2[key]
            }
        })
    }

    return result
}

module.exports = DeepMergeObjects