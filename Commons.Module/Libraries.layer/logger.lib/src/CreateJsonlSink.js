/*
 * Sink de arquivo — uma linha JSON por evento (JSONL).
 *
 * As três regras que governam este arquivo:
 *
 *   1. Nunca derrubar o processo. Toda falha de I/O (disco cheio, permissão,
 *      caminho inexistente) é engolida.
 *   2. Nunca bloquear quem chamou. `Write` só enfileira; a escrita acontece
 *      fora do caminho crítico, num `setImmediate`.
 *   3. Nunca usar `console` — nem para reclamar de uma falha de escrita.
 *
 * Modo de arquivo:
 *   - por padrão, um arquivo por dia com rotação por tamanho e retenção;
 *   - com `fileName`, um arquivo fixo (é o caso de `instances/<instanceId>.jsonl`,
 *     em que o recorte é a instância e não a data).
 */

const fs   = require("fs")
const path = require("path")

const { SerializeRecordLine } = require("./Serialize")
const { GetLocalDateStamp }   = require("./Timestamp")

const {
	ResolveLogFilePath,
	ApplyRetention
} = require("./Rotation")

const CreateJsonlSink = ({
	dirPath,
	fileName,
	maxFileSizeMb,
	retentionDays
} = {}) => {

	const pendingLines = []

	let isDraining          = false
	let currentDrain        = null
	let lastRetentionStamp  = null
	let discardedLineCount  = 0

	const EnsureDirectory = () => {
		try {
			fs.mkdirSync(dirPath, { recursive : true })
			return true
		} catch (error) {
			return false
		}
	}

	/*
	 * A retenção roda uma vez por dia de execução: na primeira escrita e a cada
	 * virada de data. Não é caminho crítico — se falhar, fica para a próxima.
	 */
	const ApplyRetentionOncePerDay = () => {

		const todayStamp = GetLocalDateStamp()

		if (lastRetentionStamp === todayStamp) {
			return
		}

		lastRetentionStamp = todayStamp

		ApplyRetention({ dirPath, retentionDays })
	}

	const ResolveTargetFilePath = () =>
		fileName
			? path.join(dirPath, fileName)
			: ResolveLogFilePath({ dirPath, maxFileSizeMb })

	const TakePendingBatch = () =>
		pendingLines.splice(0, pendingLines.length).join("")

	const AppendBatch = (batch) => new Promise((resolve) => {

		if (!EnsureDirectory()) {
			discardedLineCount = discardedLineCount + 1
			resolve()
			return
		}

		ApplyRetentionOncePerDay()

		let targetFilePath = null

		try {
			targetFilePath = ResolveTargetFilePath()
		} catch (error) {
			discardedLineCount = discardedLineCount + 1
			resolve()
			return
		}

		fs.appendFile(targetFilePath, batch, "utf8", () => {
			/* Sucesso e falha terminam do mesmo jeito: o processo segue. */
			resolve()
		})
	})

	const Drain = () => {

		isDraining = true

		currentDrain = (async () => {

			while (pendingLines.length > 0) {
				await AppendBatch(TakePendingBatch())
			}

			isDraining = false
		})()

		return currentDrain
	}

	const ScheduleDrain = () => {

		if (isDraining) {
			return
		}

		isDraining = true

		setImmediate(() => {
			isDraining = false
			Drain()
		})
	}

	const Write = (record) => {

		try {

			if (!dirPath) {
				return
			}

			const line = SerializeRecordLine(record)

			if (line === null) {
				discardedLineCount = discardedLineCount + 1
				return
			}

			pendingLines.push(line)

			ScheduleDrain()

		} catch (error) {
			/* Log é observabilidade, não caminho crítico. */
		}
	}

	const Flush = async () => {

		try {

			while (pendingLines.length > 0 || currentDrain !== null) {

				if (currentDrain !== null) {
					await currentDrain
					currentDrain = null
				}

				if (pendingLines.length > 0) {
					await Drain()
					currentDrain = null
				}
			}

		} catch (error) {
			/* Nada a fazer: o que não foi escrito, não foi escrito. */
		}
	}

	/*
	 * Última chance, no `process.on("exit")`: ali não há mais event loop, então
	 * a única escrita possível é síncrona.
	 */
	const FlushSync = () => {

		try {

			if (pendingLines.length === 0 || !dirPath) {
				return
			}

			if (!EnsureDirectory()) {
				return
			}

			fs.appendFileSync(ResolveTargetFilePath(), TakePendingBatch(), "utf8")

		} catch (error) {
			/* Log é observabilidade, não caminho crítico. */
		}
	}

	const Close = async () => {
		await Flush()
		FlushSync()
	}

	return {
		target : "file",
		Write,
		Flush,
		FlushSync,
		Close,
		GetDiscardedLineCount : () => discardedLineCount
	}
}

module.exports = CreateJsonlSink
