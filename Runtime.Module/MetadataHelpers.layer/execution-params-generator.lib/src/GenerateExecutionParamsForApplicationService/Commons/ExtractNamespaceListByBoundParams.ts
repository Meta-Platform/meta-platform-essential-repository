const ExtractNamespaceListByBoundParams = (boundParams: any): any => {
    const list: any[] = Object
    .values(boundParams)
    .reduce((listAcc: any, value: any) => {
        if(value === undefined){
            return listAcc
        } else if(typeof value === "string"){
            return [...listAcc, value]
        }else {
            return [...listAcc, ...ExtractNamespaceListByBoundParams(value)]
        }
    }, [] as any[]) as any[]

    return Array.from(new Set(list))
}

module.exports = ExtractNamespaceListByBoundParams