#!/usr/bin/env node
/*
 * Instala o gatilho de verificações da Meta Platform nos repositórios do
 * checkout. Hoje o hook dispara o lint de UI e o gate de params de boot.json —
 * cada um só quando o commit toca a superfície dele.
 *
 * O problema que isto resolve: `lint-ui-kit.js` existe desde a Fase 0 e passou
 * SEMANAS em vermelho sem ninguém perceber — um WebGui nasceu depois do plano,
 * não entrou em lista nenhuma e quebrou o lint. Um verificador que ninguém
 * dispara é documentação, não trava.
 *
 * Rodar da raiz do checkout de distribuição:
 *   node repos/essential-repository/Main.Module/Application.layer/\
 *   maintenance-toolkit.cli/scripts/install-lint-hooks.js
 *
 * Idempotente: instalar duas vezes não duplica nada. Para desinstalar, apague
 * o arquivo `.git/hooks/pre-commit` do repositório.
 */

const fs   = require("fs")
const path = require("path")

const ROOT = path.resolve(__dirname, "../../../../../..")
const ORIGEM = path.join(__dirname, "hooks", "pre-commit")

// Onde os repositórios ficam lado a lado no checkout de distribuição.
const CONTEINERES = ["repos", "thrid-party-repos"]

/*
 * Descoberta, e não lista fixa. Uma lista fixa foi justamente o que deixou o
 * lint em vermelho por semanas: repositório novo não entra em lista nenhuma.
 * Qualquer diretório versionado que esteja sob os contêineres é candidato — o
 * hook em si decide, a cada commit, se tem o que verificar.
 */
const DescobrirRepositorios = () =>
    CONTEINERES
    .map((conteiner) => path.join(ROOT, conteiner))
    .filter((conteiner) => fs.existsSync(conteiner))
    .flatMap((conteiner) => fs.readdirSync(conteiner, { withFileTypes: true })
        .filter((entrada) => entrada.isDirectory())
        .map((entrada) => path.join(path.basename(conteiner), entrada.name)))
    .filter((relativo) => fs.existsSync(path.join(ROOT, relativo, ".git")))

const MARCA = "Gatilho do lint de UI da Meta Platform"

const Instalar = (relativo) => {

    const repo = path.join(ROOT, relativo)

    if(!fs.existsSync(path.join(repo, ".git"))){
        console.log(`  ${relativo}: pulado — não é um repositório git aqui.`)
        return "pulado"
    }

    // Um repositório aninhado pode ter o .git como ARQUIVO (worktree/submodule),
    // e aí o diretório de hooks está em outro lugar.
    const gitPath = path.join(repo, ".git")
    let hooksDir
    if(fs.statSync(gitPath).isDirectory()){
        hooksDir = path.join(gitPath, "hooks")
    } else {
        const conteudo = fs.readFileSync(gitPath, "utf8").trim()
        const casamento = conteudo.match(/^gitdir:\s*(.+)$/)
        if(!casamento){
            console.log(`  ${relativo}: pulado — .git é arquivo mas não aponta um gitdir.`)
            return "pulado"
        }
        hooksDir = path.join(path.resolve(repo, casamento[1]), "hooks")
    }

    fs.mkdirSync(hooksDir, { recursive: true })
    const destino = path.join(hooksDir, "pre-commit")

    // Não sobrescreve hook de outra pessoa em silêncio.
    if(fs.existsSync(destino)){
        const atual = fs.readFileSync(destino, "utf8")
        if(!atual.includes(MARCA)){
            console.log(`  ${relativo}: JÁ EXISTE um pre-commit que não é este. Não sobrescrevi.`)
            console.log(`             Encadeie à mão, ou mova o seu antes de rodar de novo.`)
            return "conflito"
        }
    }

    fs.copyFileSync(ORIGEM, destino)
    fs.chmodSync(destino, 0o755)
    console.log(`  ${relativo}: instalado.`)
    return "instalado"
}

if(!fs.existsSync(ORIGEM)){
    console.error(`Origem do hook não encontrada: ${ORIGEM}`)
    process.exit(2)
}

console.log("Instalando o gatilho de verificações da Meta Platform:")
const resultados = DescobrirRepositorios().map(Instalar)

const conflitos = resultados.filter((r) => r === "conflito").length
console.log("")
console.log("O hook roda o lint de UI quando o commit toca `*.webgui/src` ou `*.uilib/src`,")
console.log("e o gate de params quando toca qualquer `metadata/*.json`.")
console.log("Ele NÃO substitui integração contínua — é contornável com --no-verify e")
console.log("não protege quem não o instalou. Os repositórios não têm CI hoje.")

process.exit(conflitos ? 1 : 0)
