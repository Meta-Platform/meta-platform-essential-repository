const SmartRequire = require("../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const GetColorLogByType = (type) => {
	switch (type) {
		case "info":
			return "bgBlue"
		case "warning":
			return "bgYellow"
		case "error":
			return "bgRed"
		default:
			return "bgGray"
	}
}

const GetLocalISODateTime = () => {
	const now = new Date()
	const offset = now.getTimezoneOffset() * 60000
	return  (new Date(now - offset)).toISOString()
}

const PrintDataLog = (dataLog, eventOrigin) => {
	
	const {
		sourceName,
		type,
		message
	} = dataLog

	const color = GetColorLogByType(type)

	const [
		dateFormatted,
		eventOriginFormatted, 
		typeFormatted,
		sourceNameFormatted
	] = [
		colors.dim(`[${GetLocalISODateTime()}]`),
		colors.bgYellow.black(`[${eventOrigin}]`),
		colors[color](`[${type}]`),
		colors.inverse(`[${sourceName}]`)
	]
	const out = `${dateFormatted} ${eventOriginFormatted} ${typeFormatted} ${sourceNameFormatted} ${message}`
	console.log(out)
	
}

module.exports = PrintDataLog