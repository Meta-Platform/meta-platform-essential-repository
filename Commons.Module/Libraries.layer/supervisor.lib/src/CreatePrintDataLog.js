const SmartRequire = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")

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


const CreatePrintDataLog = async () =>{
	
	return (dataLog) => {
	
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
			colors.bgMagenta.black("[ecosystem-daemon]"),
			colors[color](`[${type.padEnd(7)}]`),
			colors.bgYellow(`[${sourceName.padEnd(23)}]`)
		]
		const out = `${dateFormatted} ${eventOriginFormatted} ${typeFormatted} ${sourceNameFormatted} ${message}`
		console.log(out)
	}
}

module.exports = CreatePrintDataLog