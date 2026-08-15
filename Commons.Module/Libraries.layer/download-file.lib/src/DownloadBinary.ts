import type { RetryOptions } from "./RunWithRetry"

const fs = require("fs") as typeof import("fs")
const path = require("path") as typeof import("path")
const { pipeline } = require("stream") as typeof import("stream")
const { promisify } = require("util") as typeof import("util")
const { RunWithRetry } = require("./RunWithRetry") as {
    RunWithRetry: <T>(operation: (attempt: number) => Promise<T>, options?: RetryOptions) => Promise<T>
}

const pipelineAsync = promisify(pipeline)

const DownloadBinary = async ({
    url,
    destinationPath,
    extName
}: {
    url: string
    destinationPath: string
    extName?: string
}): Promise<string>  => {
    const fileName = path.basename(url) + (extName ? `.${extName}` : "")
    const filePath = path.resolve(destinationPath, fileName)

    return await RunWithRetry(async () => {
        // Recomeço limpo entre tentativas: um arquivo parcial de uma tentativa
        // que caiu no meio do stream não pode contaminar a próxima.
        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath)
        }

        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
        }
        const writer = fs.createWriteStream(filePath)
        // `response.body` é um ReadableStream da Web; o `pipeline` do Node aceita
        // os dois mundos em runtime, mas a assinatura publicada só descreve o
        // stream do Node.
        await pipelineAsync(response.body as any, writer)

        return filePath
    }, { label: `download ${fileName}` })
}

module.exports = DownloadBinary
