const os = require("os")
const { resolve } = require("path")

// Detecta o caso em que declarar um recurso SEQUESTRA um parâmetro que já tinha
// valor — o defeito que derrubou o control plane inteiro (VDRP-215) e que já
// havia mordido duas vezes antes (VDRP-41, VDRP-42).
//
// COMO O SEQUESTRO ACONTECE
//
// O recurso resolvido é aplicado por ÚLTIMO sobre o `startup-params` do nó (ver
// ApplyResourceParamsToHierarchy). Isso é intencional: é o que faz o recurso
// declarado vencer um caminho absoluto esquecido no metadata. Mas quando o nome
// do parâmetro é o mesmo que o pacote já usa para OUTRA coisa — `socket`, que é
// por onde o servidor LIGA; `storageFilePath`, que é o banco com dados vivos —
// a substituição não é um upgrade: é uma troca de identidade de recurso, feita
// em silêncio, e o sintoma aparece longe da causa (ECONNREFUSED em toda a frota,
// ou um SQLite recém-criado e vazio ao lado do banco real).
//
// O QUE CONTA COMO COLISÃO
//
// Só a DIVERGÊNCIA. Um parâmetro declarado como recurso que já tem literal com
// o MESMO caminho é redundante, não perigoso — o valor efetivo não muda, e
// recusá-lo obrigaria a limpar metadados corretos sem ganho. Colisão é quando o
// caminho resolvido difere do valor que estava lá: alguém vai continuar usando
// o caminho antigo (a CLI, um bind-mount, o banco em uso) enquanto o pacote
// passa a usar o novo.
//
// Vale tanto para o dono quanto para quem só referencia: um cliente que declara
// o socket de outro pacote e diverge do caminho literal simplesmente conecta no
// lugar errado.

// `~` é o que se escreve no startup-params.json; o caminho resolvido já vem
// absoluto. Sem expandir, todo literal com `~` pareceria divergente.
const _ExpandHome = (value) =>
    typeof value === "string" && value.startsWith("~")
        ? value.replace("~", os.homedir())
        : value

const _SamePath = (literal, resolved) => {
    if(typeof literal !== "string" || !literal) return false
    return resolve(_ExpandHome(literal)) === resolve(resolved)
}

// Colisões de UM nó: cruza o que o pacote declarou como recurso com o que o
// `startup-params` do nó já trazia (literal do próprio pacote ou base do
// ecossistema — as duas fontes são igualmente sequestráveis).
const DetectResourceParamCollisions = ({ metadata, resources, packagePath }) => {

    const startupParams = (metadata && metadata["startup-params"]) || {}

    return (resources || [])
        .filter(({ parameter }) => startupParams[parameter] !== undefined && startupParams[parameter] !== null)
        .filter(({ parameter, path }) => !_SamePath(startupParams[parameter], path))
        .map(({ parameter, kind, owner, path }) => ({
            packagePath,
            packageNamespace : metadata && metadata.package && metadata.package.namespace,
            parameter,
            kind,
            owner,
            currentValue     : startupParams[parameter],
            resourceValue    : path
        }))
}

// Mensagem única para as duas políticas (falhar ou avisar). Nomeia os DOIS
// lados porque o que custa caro no diagnóstico é justamente descobrir que existe
// um segundo valor para o mesmo nome.
const DescribeCollision = ({ packageNamespace, packagePath, parameter, kind, owner, currentValue, resourceValue }) =>
    `'${parameter}' está declarado em ${kind}-params (${owner ? "dono" : "referência"}) de ` +
    `${packageNamespace || packagePath} e JÁ TEM outro valor no startup-params: ` +
    `o recurso resolveria para '${resourceValue}' e substituiria '${currentValue}'. ` +
    `Renomeie o parâmetro do recurso OU remova o valor antigo — declarar os dois deixa ` +
    `o pacote usando um caminho e quem depende dele usando outro.`

const BuildCollisionError = (collisions) =>
    new Error(
        `resource-params-handler: ${collisions.length} recurso(s) declarado(s) colidem com parâmetros que já têm valor.\n` +
        collisions.map((collision) => `  - ${DescribeCollision(collision)}`).join("\n")
    )

module.exports = DetectResourceParamCollisions
module.exports.DescribeCollision   = DescribeCollision
module.exports.BuildCollisionError = BuildCollisionError
