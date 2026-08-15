/*
 * Carimbo de tempo LOCAL, no formato `2026-07-27T10:12:03.412`.
 *
 * É o mesmo cálculo que `PrintDataLog.js` já fazia (deslocar pelo offset do
 * fuso e serializar em ISO), sem o `Z` final — que mentiria, já que o valor não
 * está em UTC.
 */

const GetLocalISODateTime = (date?: Date): string => {

	const reference = (date instanceof Date) && !isNaN(date.getTime())
		? date
		: new Date()

	const offsetInMilliseconds = reference.getTimezoneOffset() * 60000

	return (new Date(reference.getTime() - offsetInMilliseconds))
		.toISOString()
		.slice(0, 23)
}

/*
 * `2026-07-27` — o nome do arquivo do dia, no mesmo fuso do carimbo, para que
 * a rotação vire à meia-noite local e não à meia-noite UTC.
 */
const GetLocalDateStamp = (date?: Date): string =>
	GetLocalISODateTime(date).slice(0, 10)

module.exports = {
	GetLocalISODateTime,
	GetLocalDateStamp
}
