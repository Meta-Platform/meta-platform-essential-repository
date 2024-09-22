const SmartRequire = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")

const colors = SmartRequire("colors")
const GetColorLogByType = require("./GetColorLogByType")

const FormatterDataLog = async (dataLog) => {
	const { sourceName, type, message } = dataLog
	const color = GetColorLogByType(type)
	const now = new Date()
	const offset = now.getTimezoneOffset() * 60000
	const localISOTime = (new Date(now - offset)).toISOString()
	const typeFormatted = type.padEnd(7)
	return `${colors.dim(`[${localISOTime}]`)} ${colors.bgBlue("[execution-supervisor]")} ${colors[color](`[${typeFormatted}]`)} ${colors.inverse(`[${sourceName}]`)} ${message}`
}

module.exports = FormatterDataLog