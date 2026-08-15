const FilterStringsWithPrefix = (array: string[], prefix: string): string[] => 
    array.filter(str => str.startsWith(prefix))

const BuildObjectFromPrefix = <T extends Record<string, any>>(object: T, prefixAttribute: string): Partial<T> => {
    const allKeys = Object.keys(object)
    const filteredKeys = FilterStringsWithPrefix(allKeys, prefixAttribute)
    const newObject = filteredKeys.reduce((acc: Partial<T>, key) => {
        return {...acc, [key]: object[key]}
    }, {})

    return newObject
}

module.exports = BuildObjectFromPrefix