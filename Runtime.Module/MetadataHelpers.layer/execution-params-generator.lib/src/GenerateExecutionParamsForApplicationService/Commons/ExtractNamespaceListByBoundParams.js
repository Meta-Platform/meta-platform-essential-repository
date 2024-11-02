const ExtractNamespaceListByBoundParams = (boundParams) => {
    const list = Object
    .values(boundParams)
    .reduce((listAcc, value) => {
        if(typeof value === "string"){
            return [...listAcc, value]
        }else {
            return [...listAcc, ...ExtractNamespaceListByBoundParams(value)]
        }
    }, [])

    return Array.from(new Set(list))
}

module.exports = ExtractNamespaceListByBoundParams