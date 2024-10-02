const FilterStringsWithPrefix = (array, prefix) => 
    array.filter(str => str.startsWith(prefix))

const BuildObjectFromPrefix = (object, prefixAttribute) => {
    const allKeys = Object.keys(object)
    const filteredKeys = FilterStringsWithPrefix(allKeys, prefixAttribute)
    const newObject = filteredKeys.reduce((acc, key) => {
        return {...acc, [key]: object[key]}
    }, {})

    return newObject
}

module.exports = BuildObjectFromPrefix