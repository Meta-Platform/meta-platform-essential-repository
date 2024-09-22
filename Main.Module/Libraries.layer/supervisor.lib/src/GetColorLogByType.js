const GetColorLogByType = (type) => {
    switch(type){
        case "success":
            return "bgGreen"
        case "info":
            return "bgBlue"
        case "warning":
            return "bgYellow"
        case "error":
            return "bgRed"
        default:
            return undefined
    }
}

module.exports = GetColorLogByType