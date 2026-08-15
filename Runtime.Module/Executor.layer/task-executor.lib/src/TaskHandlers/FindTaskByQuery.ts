import type { Task, TaskStatus } from "../../types/Task"

const VerifyPropertyContent = (chunck: any, propertyStack: any, queryValue: any) => {
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

const ConvertPropertyQueryToStack = (propertyQuery: any) => 
        propertyQuery.split(".").reverse()

const IsTaskMatching = ({ task, taskQuery }: { task: Task, taskQuery: any }) => {
    const isMatch = Object.keys(taskQuery)
    .reduce((isMarchAcc: any, propertyQuery: any) => {
        if(isMarchAcc){
            const propertyStack = ConvertPropertyQueryToStack(propertyQuery)
            const queryValue = taskQuery[propertyQuery]
            return VerifyPropertyContent(task, propertyStack, queryValue)
        }
        return isMarchAcc
    }, true)
    return isMatch
}

const FindTaskByQuery = (taskStateManager: any, taskQuery: any) => {
    const taskFound = taskStateManager
        .ListTasks()
        .find((task: Task) => IsTaskMatching(({task, taskQuery})))

    return taskFound
}

module.exports = FindTaskByQuery