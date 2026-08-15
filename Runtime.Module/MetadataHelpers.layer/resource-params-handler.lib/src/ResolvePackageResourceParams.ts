import type { MetadataHierarchy, PackageMetadata } from "../../dependency-graph-builder.lib/types/MetadataHierarchy"
import type { NormalizedResourceParam, ResolvedResource } from "./Types"

/** O que cada resolvedor precisa saber do ecossistema para montar o caminho. */
type ResolveContext = {
    packageName?: string
    installDataDirPath: string
    socketsDirName?: string
    supervisorSocketsDirName?: string
    storageDirName?: string
}

const { join, dirname } = require("path") as typeof import("path")

const NormalizeResourceParam = require("./NormalizeResourceParam")
const { InferStorageType }   = NormalizeResourceParam

// Fallback intencional (mesma postura do CFGEC-30 no dependency-graph-builder):
// uma instalação anterior a estas variáveis não tem a chave no
// `ecosystem-defaults.json` materializado, e o ecossistema tem de continuar
// subindo. Os valores são os mesmos do ecosystem-defaults de referência.
const DEFAULT_SOCKETS_DIRNAME            = "sockets"
const DEFAULT_SUPERVISOR_SOCKETS_DIRNAME = "supervisor-sockets"
const DEFAULT_STORAGE_DIRNAME            = "storage"

const SOCKET_FILE_EXTENSION = ".sock"

// O namespace do pacote (`@/ecosystem-instance-manager.app`) é o nome com o qual
// o ecossistema já o identifica em todo lugar; usá-lo como namespace default do
// recurso evita inventar uma segunda identidade para a mesma coisa.
const _PackageNameOf = (metadata?: PackageMetadata): string | undefined => {
    const namespace = metadata && metadata.package && metadata.package.namespace
    return namespace ? String(namespace).replace("@/", "") : undefined
}

const _ResolveSocket = (resource: NormalizedResourceParam, { packageName, installDataDirPath, socketsDirName, supervisorSocketsDirName }: ResolveContext): ResolvedResource => {

    const namespace = resource.namespace || packageName
    if(!namespace)
        throw new Error(`resource-params-handler: não foi possível resolver o namespace do socket '${resource.parameter}' — declare 'namespace' ou garanta o package.json do pacote.`)

    // O socket é sempre um arquivo na pasta plana de sockets: é o formato que os
    // clientes já esperam, e mudá-lo quebraria conexões em uso.
    const filename = resource.filename || `${namespace}${SOCKET_FILE_EXTENSION}`

    const baseDirName = resource.scope === "supervisor"
        ? (supervisorSocketsDirName || DEFAULT_SUPERVISOR_SOCKETS_DIRNAME)
        : (socketsDirName || DEFAULT_SOCKETS_DIRNAME)

    const path = join(installDataDirPath, baseDirName, filename)

    return {
        ...resource,
        kind    : "socket",
        namespace,
        filename,
        type    : "file",
        path,
        // O socket em si quem cria é o servidor ao escutar; ao ecossistema cabe
        // garantir que a pasta exista antes disso.
        dirPath : dirname(path)
    }
}

const _ResolveStorage = (resource: NormalizedResourceParam, { packageName, installDataDirPath, storageDirName }: ResolveContext): ResolvedResource => {

    const namespace = resource.namespace || packageName
    if(!namespace)
        throw new Error(`resource-params-handler: não foi possível resolver o namespace do storage '${resource.parameter}' — declare 'namespace' ou garanta o package.json do pacote.`)

    const namespaceDirPath = join(installDataDirPath, storageDirName || DEFAULT_STORAGE_DIRNAME, namespace)

    // Sem `filename`, o recurso É a pasta do namespace — é como um pacote pede
    // "um lugar meu para escrever" sem se comprometer com um layout interno.
    if(!resource.filename)
        return {
            ...resource,
            kind    : "storage",
            namespace,
            type    : "directory",
            path    : namespaceDirPath,
            dirPath : namespaceDirPath
        }

    const type = resource.type || InferStorageType(resource.filename)
    const path = join(namespaceDirPath, resource.filename)

    return {
        ...resource,
        kind    : "storage",
        namespace,
        type,
        path,
        // Arquivo: o ecossistema prepara a pasta que o contém e deixa o pacote
        // criar o arquivo (um SQLite vazio criado por fora não é um SQLite).
        dirPath : type === "file" ? namespaceDirPath : path
    }
}

// Traduz as declarações de recurso de UM pacote nos caminhos reais em disco.
// Não toca no filesystem — quem materializa é o EnsureResources, para que este
// módulo continue puro e testável.
const ResolvePackageResourceParams = ({
    metadata,
    installDataDirPath,
    ECOSYSTEMDATA_CONF_DIRNAME_UNIX_SOCKET_DIR,
    ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR,
    ECOSYSTEMDATA_CONF_DIRNAME_STORAGE_DIR
}: {
    metadata?: PackageMetadata
    installDataDirPath: string
    ECOSYSTEMDATA_CONF_DIRNAME_UNIX_SOCKET_DIR?: string
    ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR?: string
    ECOSYSTEMDATA_CONF_DIRNAME_STORAGE_DIR?: string
}): ResolvedResource[] => {

    if(!metadata) return []

    const socketParams  = metadata["socket-params"]
    const storageParams = metadata["storage-params"]

    if(!socketParams && !storageParams) return []

    if(!installDataDirPath)
        throw new Error("resource-params-handler: 'installDataDirPath' é obrigatório para resolver socket-params/storage-params.")

    const context = {
        packageName              : _PackageNameOf(metadata),
        installDataDirPath,
        socketsDirName           : ECOSYSTEMDATA_CONF_DIRNAME_UNIX_SOCKET_DIR,
        supervisorSocketsDirName : ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR,
        storageDirName           : ECOSYSTEMDATA_CONF_DIRNAME_STORAGE_DIR
    }

    const _Resolve = (params: Record<string, any> | undefined, Resolver: (resource: NormalizedResourceParam, context: ResolveContext) => ResolvedResource) =>
        Object
            .keys(params || {})
            .map((parameter) => Resolver(NormalizeResourceParam(parameter, params![parameter]), context))

    return [
        ..._Resolve(socketParams,  _ResolveSocket),
        ..._Resolve(storageParams, _ResolveStorage)
    ]
}

module.exports = ResolvePackageResourceParams
module.exports.DEFAULT_SOCKETS_DIRNAME            = DEFAULT_SOCKETS_DIRNAME
module.exports.DEFAULT_SUPERVISOR_SOCKETS_DIRNAME = DEFAULT_SUPERVISOR_SOCKETS_DIRNAME
module.exports.DEFAULT_STORAGE_DIRNAME            = DEFAULT_STORAGE_DIRNAME
