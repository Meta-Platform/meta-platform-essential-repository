const VerifyPropertyContent = (chunck, propertyStack, queryValue) => {
    const property = propertyStack.pop()
    const chunkValue = chunck[property]
    if(chunkValue){
        if(propertyStack.length > 0){
            return VerifyPropertyContent(chunkValue, propertyStack, queryValue)
        } else {
            if(queryValue){
                const { type, value } = queryValue
                if(type === "="){
                    return chunkValue === value
                } else {
                    return false
                }
            }
            return true
        }
    }
    return false
}

const ConvertPropertyQueryToStack = (propertyQuery) => 
        propertyQuery.split(".").reverse()

const IsTaskMatching = ({ task, taskQuery }) => {
    const isMatch = Object.keys(taskQuery)
    .reduce((isMarchAcc, propertyQuery) => {
        if(isMarchAcc){
            const propertyStack = ConvertPropertyQueryToStack(propertyQuery)
            const queryValue = taskQuery[propertyQuery]
            return VerifyPropertyContent(task, propertyStack, queryValue)
        }
        return isMarchAcc
    }, true)
    return isMatch
}

const FindTaskByQuery = (taskStateManager, taskQuery) => {
    const taskFound = taskStateManager
        .ListTasks()
        .find((task) => IsTaskMatching(({task, taskQuery})))

    return taskFound
}

module.exports = FindTaskByQuery