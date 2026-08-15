import type { TargetedSink } from "./Types"

/**
 * Acrescenta ao logger a superfície que opera sobre os SINKS: registrar,
 * remover e drenar.
 *
 * Está fora do CreateLogger porque não tem nada a ver com escrever log — é
 * administração dos destinos. Todas as três drenagens seguem a mesma regra: um
 * sink que falha não interrompe os outros, porque log é observabilidade e não
 * caminho crítico.
 */
const AttachSinkControls = (logger: any, sinks: TargetedSink[]): void => {

	/*
	 * Sink registrado em tempo de execução. Existe para quem precisa OUVIR o log
	 * sem ser um destino permanente — o caso concreto é o NotificationHub, que
	 * mostra no painel o progresso de uma instalação (ADR-05 / LOGS-32).
	 *
	 * Atenção ao escopo: o logger é global, então um ouvinte registrado durante
	 * uma operação recebe TUDO o que o processo logar naquela janela, não apenas
	 * o da operação. Registre pelo menor tempo possível e remova no `finally`.
	 */
	logger.AddSink = (sink: TargetedSink) => {
		if (sink && typeof sink.Write === "function") sinks.push(sink)
		return () => logger.RemoveSink(sink)
	}

	logger.RemoveSink = (sink: TargetedSink) => {
		const posicao = sinks.indexOf(sink)
		if (posicao !== -1) sinks.splice(posicao, 1)
	}

	const DrainAsync = (operation: "Flush" | "Close") => async () => {
		for (const sink of sinks) {
			try {
				if (sink && typeof sink[operation] === "function") {
					await sink[operation]!()
				}
			} catch (error) {
				/* segue */
			}
		}
	}

	logger.Flush = DrainAsync("Flush")
	logger.Close = DrainAsync("Close")

	/* Síncrono, e não uma variante do acima: no `exit` não há mais event loop —
	 * uma Promise ali nunca seria resolvida. Ver InstallGlobalLogger. */
	logger.FlushSync = () => {
		sinks.forEach((sink) => {
			try {
				if (sink && typeof sink.FlushSync === "function") {
					sink.FlushSync()
				}
			} catch (error) {
				/* segue */
			}
		})
	}
}

module.exports = AttachSinkControls
