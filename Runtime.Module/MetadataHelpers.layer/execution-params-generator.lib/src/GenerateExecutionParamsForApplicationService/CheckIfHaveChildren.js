const CheckIfHaveChildren = (bootMetadata) => {
    const { services, endpoints, windows } = bootMetadata
    return (services && services.length > 0)
    || (endpoints && endpoints.length > 0)
    || (windows && windows.length > 0)
}

module.exports = CheckIfHaveChildren