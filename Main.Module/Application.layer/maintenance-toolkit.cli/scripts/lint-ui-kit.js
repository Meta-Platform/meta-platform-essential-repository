#!/usr/bin/env node
/*
 * Lint anti-regressão da UI padronizada.
 *
 * Falha (exit 1) quando um WebGui monta interface fora do padrão:
 *
 *   - importa `semantic-ui-react` direto — o Semantic é encapsulado pelo kit
 *     (`@i-components`), e é de lá que o aplicativo importa Button, Icon,
 *     Modal, Input…;
 *   - importa `styled-components` — o visual sai dos tokens --mp-* e das
 *     classes do kit, não de CSS-in-JS por componente;
 *   - redefine no CSS uma classe do design system (`.mp-*`) — variação nova
 *     nasce no kit, como modificador, e vira história no ui-catalog.
 *
 * A lista PENDENTES é a dívida conhecida: são os WebGui que ainda não passaram
 * pela migração. Ela só pode DIMINUIR — ao migrar um aplicativo, remova a linha
 * dele daqui. Quando esvaziar, apague a lista e o lint passa a valer para todos.
 *
 * Rodar a partir da raiz do meta-platform-repo:
 *   node repos/essential-repository/Main.Module/Application.layer/\
 *   maintenance-toolkit.cli/scripts/lint-ui-kit.js
 */

const { execSync } = require("child_process")
const fs   = require("fs")
const path = require("path")

const ROOT = path.resolve(__dirname, "../../../../../..")

/*
 * Fora do escopo, e por quê:
 *   - o próprio kit e as bibliotecas de área ENCAPSULAM o Semantic — é o
 *     trabalho delas;
 *   - node_modules, dist e build são artefato, não fonte.
 */
const PERMITIDOS = [
    // Regra genérica em vez de enumerar o kit pelo nome: qualquer biblioteca de
    // UI futura já nasce coberta, sem depender de alguém lembrar de acrescentá-la
    // aqui. O kit comum saiu deste repositório e mora no ecosystem core.
    /\.uilib\//,
    /\/node_modules\//,
    /\/dist\//,
    /\/build\//
]

/*
 * DÍVIDA CONHECIDA — WebGui ainda não migrados (ondas 2 e 3 do plano de
 * padronização). Remova a entrada ao migrar o aplicativo.
 */
const PENDENTES = [
    /launcher\.webgui\//,
    /datasource-manager\.webgui\//,
    /home-screen\.webgui\//,
    /instance-executor-control-panel\.webgui\//,
    /meta-project-manager\.webgui\//,
    /package-developer\.webgui\//,
    /container-manager\.webgui\//
]

const REGRAS = [
    {
        nome   : "import direto de semantic-ui-react",
        padrao : /from\s+["']semantic-ui-react["']|require\(["']semantic-ui-react["']\)/,
        dica   : "importe o componente de \"@i-components\""
    },
    {
        nome   : "styled-components",
        padrao : /from\s+["']styled-components["']/,
        dica   : "use as classes do kit e os tokens --mp-*"
    }
]

/* No CSS: redefinir classe do design system dissolve o padrão. */
const REGRA_CSS = {
    nome   : "redefinição de classe .mp-* do design system",
    padrao : /^\s*\.mp-[a-z0-9-]+[^{]*\{/,
    dica   : "a variação nasce no kit como modificador, com história no ui-catalog"
}

const Casa = (lista, arquivo) => lista.some((padrao) => padrao.test(arquivo))
const EhComentario = (linha) => /^\s*(\/\/|\*|\/\*)/.test(linha)

let arquivos
try {
    arquivos = execSync(
        // Escopo: o Application Repository, dono do kit e dos desktop apps do
        // padrão. Outros repositórios (core, virtual-desk, engineering-tools)
        // têm WebGui próprios e entram quando adotarem o kit.
        `find repos/applications-repository -path '*.webgui/src/*' \\( -name '*.ts' -o -name '*.tsx' -o -name '*.css' \\) -not -path '*/node_modules/*'`,
        { cwd : ROOT, maxBuffer : 32 * 1024 * 1024 }
    ).toString().trim().split("\n").filter(Boolean)
} catch (e) {
    console.error("Falha ao listar arquivos:", e.message)
    process.exit(2)
}

const infracoes = []
const pendentesTocados = new Set()

for (const relativo of arquivos) {

    if (Casa(PERMITIDOS, relativo)) continue

    const ehPendente = Casa(PENDENTES, relativo)

    let conteudo
    try { conteudo = fs.readFileSync(path.join(ROOT, relativo), "utf8") } catch (e) { continue }

    const ehCss = relativo.endsWith(".css")
    const regras = ehCss ? [ REGRA_CSS ] : REGRAS

    conteudo.split("\n").forEach((linha, indice) => {

        if (EhComentario(linha)) return

        for (const regra of regras) {
            if (!regra.padrao.test(linha)) continue
            if (ehPendente) { pendentesTocados.add(relativo.split("/src/")[0]); return }
            infracoes.push({
                arquivo : relativo,
                linha   : indice + 1,
                regra   : regra.nome,
                dica    : regra.dica,
                texto   : linha.trim().slice(0, 90)
            })
            return
        }
    })
}

if (pendentesTocados.size) {
    console.warn(`Dívida conhecida (não falha): ${pendentesTocados.size} WebGui ainda fora do padrão.`)
    Array.from(pendentesTocados).sort().forEach((pacote) => console.warn(`  - ${pacote}`))
    console.warn("")
}

if (infracoes.length) {
    infracoes.forEach((i) =>
        console.error(`[${i.regra}] ${i.arquivo}:${i.linha}\n            ${i.texto}\n            → ${i.dica}`))
    console.error(`\nFALHA: ${infracoes.length} ocorrência(s) fora do padrão de UI.`)
    process.exit(1)
}

console.log("OK: nenhum WebGui migrado voltou a montar interface fora do kit.")
