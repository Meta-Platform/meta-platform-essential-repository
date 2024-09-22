const CheckIfHaveChildren = (bootMetadata) => {
    const { services, endpoints } = bootMetadata
    return (services && services.length > 0) 
    || (endpoints && endpoints.length > 0)
}

module.exports = CheckIfHaveChildren