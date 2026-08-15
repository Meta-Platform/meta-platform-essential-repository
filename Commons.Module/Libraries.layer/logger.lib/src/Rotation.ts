/*
 * Rotação e retenção dos arquivos de log.
 *
 * Um arquivo por dia — `2026-07-27.jsonl`. Ao estourar o teto de tamanho, o dia
 * ganha partes numeradas — `2026-07-27.1.jsonl`, `2026-07-27.2.jsonl`.
 * Arquivos mais velhos que a retenção configurada são descartados.
 *
 * A retenção nasce junto com a escrita, e não depois, porque foi exatamente a
 * ordem inversa que deixou o `instance-logs/` acumular 32 arquivos sem nenhuma
 * limpeza.
 */

const fs   = require("fs") as typeof import("fs")
const path = require("path") as typeof import("path")

const { GetLocalDateStamp } = require("./Timestamp")

const LOG_FILE_EXTENSION = ".jsonl"
const DATE_STAMP_PATTERN = /^(\d{4}-\d{2}-\d{2})(?:\.(\d+))?\.jsonl$/

const DEFAULT_MAX_FILE_SIZE_MB = 50
const DEFAULT_RETENTION_DAYS   = 30

const ToPositiveNumber = (value: unknown, fallback: number): number => {

	const parsed = typeof value === "number" ? value : parseFloat(String(value))

	return (Number.isFinite(parsed) && parsed > 0) ? parsed : fallback
}

const GetFileSize = (filePath: string): number => {
	try {
		return fs.statSync(filePath).size
	} catch (error) {
		return 0
	}
}

const Exists = (filePath: string): boolean => {
	try {
		return fs.existsSync(filePath)
	} catch (error) {
		return false
	}
}

const BuildFileName = (dateStamp: string, part: number): string =>
	part > 0
		? `${dateStamp}.${part}${LOG_FILE_EXTENSION}`
		: `${dateStamp}${LOG_FILE_EXTENSION}`

/*
 * O arquivo em que a próxima escrita deve cair: a última parte do dia que ainda
 * cabe no teto. Se a última parte já estourou, a próxima é criada.
 */
const ResolveLogFilePath = ({
	dirPath,
	date,
	maxFileSizeMb
}: {
	dirPath: string
	date?: Date
	maxFileSizeMb?: unknown
}): string => {

	const dateStamp       = GetLocalDateStamp(date)
	const maxFileSizeInMb = ToPositiveNumber(maxFileSizeMb, DEFAULT_MAX_FILE_SIZE_MB)
	const maxSizeInBytes  = maxFileSizeInMb * 1024 * 1024

	let part = 0

	for (;;) {

		const candidatePath = path.join(dirPath, BuildFileName(dateStamp, part))

		if (!Exists(candidatePath)) {
			return candidatePath
		}

		if (GetFileSize(candidatePath) < maxSizeInBytes) {
			return candidatePath
		}

		part = part + 1
	}
}

const ParseDateStamp = (fileName: string): string | null => {

	const matched = DATE_STAMP_PATTERN.exec(fileName)

	return matched === null ? null : matched[1]
}

/*
 * Descarta os arquivos cuja data é anterior ao prazo. A comparação é feita
 * sobre o NOME (a data local do arquivo), não sobre o mtime: copiar ou
 * restaurar um log não pode ressuscitá-lo nem antecipar seu descarte.
 */
const ApplyRetention = ({
	dirPath,
	retentionDays,
	now
}: {
	dirPath: string
	retentionDays?: unknown
	now?: Date
}): string[] => {

	const retentionInDays = ToPositiveNumber(retentionDays, DEFAULT_RETENTION_DAYS)

	const reference = (now instanceof Date) && !isNaN(now.getTime()) ? now : new Date()

	const limitDate = new Date(reference.getTime() - (retentionInDays * 24 * 60 * 60 * 1000))
	const limitStamp = GetLocalDateStamp(limitDate)

	const removed: string[] = []

	try {

		fs.readdirSync(dirPath).forEach((fileName) => {

			const dateStamp = ParseDateStamp(fileName)

			if (dateStamp === null || dateStamp >= limitStamp) {
				return
			}

			try {
				fs.unlinkSync(path.join(dirPath, fileName))
				removed.push(fileName)
			} catch (error) {
				/* Um arquivo que não pôde ser removido não interrompe os demais. */
			}
		})

	} catch (error) {
		/* Diretório inexistente ou ilegível: nada a descartar. */
	}

	return removed
}

module.exports = {
	LOG_FILE_EXTENSION,
	DEFAULT_MAX_FILE_SIZE_MB,
	DEFAULT_RETENTION_DAYS,
	BuildFileName,
	ParseDateStamp,
	ResolveLogFilePath,
	ApplyRetention
}
