#!/usr/bin/env node
/*
 * Lint anti-regressão da UI padronizada.
 *
 * Falha (exit 1) quando um WebGui — ou a própria biblioteca de UI — monta
 * interface fora do padrão:
 *
 *   - importa `semantic-ui-react` — o kit não encapsula mais o Semantic, ele
 *     o substituiu: Button, Icon, Modal e Input são componentes próprios,
 *     importados de `@i-components`;
 *   - importa `styled-components` — o visual sai dos tokens --mp-* e das
 *     classes do kit, não de CSS-in-JS por componente;
 *   - redefine no CSS uma classe do design system (`.mp-*`) — variação nova
 *     nasce no kit, como modificador, e vira história no ui-catalog.
 *
 * A lista PENDENTES é a dívida conhecida: são os WebGui que ainda não passaram
 * pela migração. Ela só pode DIMINUIR — ao migrar um aplicativo, remova a linha
 * dele daqui. Hoje ela está VAZIA: a dívida foi zerada e o lint vale para todos.
 * A lista continua existindo para quando um repositório novo entrar no escopo.
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
 * Fora do escopo: node_modules, dist e build são artefato, não fonte.
 */
const PERMITIDOS = [
    /\/node_modules\//,
    /\/dist\//,
    /\/build\//
]

/*
 * As bibliotecas de UI (`.uilib`) eram isentas de TUDO enquanto encapsulavam o
 * Semantic — era o trabalho delas. Desde o APPUI-117 o kit não usa mais
 * Semantic (nem em componente, nem em folha de estilo, nem em dependência do
 * package.json), e a isenção geral caiu junto: importar `semantic-ui-react` ou
 * `styled-components` é infração TAMBÉM no kit.
 *
 * Sobra uma isenção, e só uma: a regra de CSS. Uma biblioteca de UI é, por
 * definição, quem DEFINE as classes `.mp-*`; acusá-la de "redefinir" seria
 * acusar a fonte.
 */
const EhBibliotecaDeUI = (arquivo) => /\.uilib\//.test(arquivo)

/*
 * DÍVIDA CONHECIDA — WebGui ainda não migrados.
 *
 * A lista está VAZIA: a dívida foi zerada, todo WebGui do escopo passou pela
 * migração e é cobrado pelas regras abaixo. O mecanismo fica de pé de
 * propósito — quando um repositório novo entrar no escopo do lint, é aqui que
 * os aplicativos dele esperam a vez, um por linha, e a lista só pode diminuir.
 */
const PENDENTES = []

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

/*
 * No CSS: redefinir GLOBALMENTE uma classe do design system dissolve o padrão.
 *
 * O que conta como redefinição global é o seletor que ATACA a classe do kit
 * diretamente — `.mp-button { }`. Um seletor DESCENDENTE (`.iep-log__bar
 * .mp-button { }`) não é a mesma coisa: ele ajusta o componente dentro de um
 * contexto, sem mudar o componente para os outros doze aplicativos. A
 * plataforma tem ~30 desses hoje, e cada um é um sinal de lacuna do kit — mas
 * lacuna se resolve promovendo variante, não quebrando o build de quem já
 * entregou.
 *
 * O padrão antigo ancorava em `^\s*` e só via a redefinição quando ela era a
 * primeira coisa da linha. Passavam despercebidas a regra indentada dentro de
 * media query e a que aparece depois de uma vírgula (`.foo, .mp-button {`) —
 * as duas são globais de verdade. Agora cada parte da lista de seletores é
 * examinada, e só é infração quando a parte COMEÇA com a classe do kit.
 */
const REGRA_CSS = {
    nome   : "redefinição global de classe .mp-* do design system",
    // Início de linha OU início de uma parte da lista (depois de vírgula).
    padrao : /(^|,)\s*\.mp-[a-z0-9-]+(?![\w-])[^,{]*\{/,
    dica   : "a variação nasce no kit como modificador, com história no ui-catalog"
}

const Casa = (lista, arquivo) => lista.some((padrao) => padrao.test(arquivo))
const EhComentario = (linha) => /^\s*(\/\/|\*|\/\*)/.test(linha)

let arquivos
try {
    arquivos = execSync(
        // Escopo: TODO WebGui e TODA biblioteca de UI dos dois repositórios que
        // adotaram o kit. Os dois WebGui do core (ecosystem-control-panel e
        // server-manager) estavam fora até a F8, quando ainda mantinham um fork
        // da matriz; migrados, entraram — a regra segue o kit, não o endereço.
        // Outros repositórios (virtual-desk, engineering-tools) têm WebGui
        // próprios e entram quando adotarem o kit.
        `find repos/applications-repository repos/ecosystem-core-repository`
        + ` \\( -path '*.webgui/src/*' -o -path '*.uilib/src/*' \\)`
        + ` \\( -name '*.ts' -o -name '*.tsx' -o -name '*.css' \\)`
        + ` -not -path '*/node_modules/*'`,
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
    const regras = ehCss
        ? (EhBibliotecaDeUI(relativo) ? [] : [ REGRA_CSS ])
        : REGRAS

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
