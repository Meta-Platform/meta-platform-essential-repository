const SmartRequire = require("../../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")
const Handlebars = SmartRequire('handlebars')

/* O Handlebars nasceu para gerar HTML, e por isso `{{ }}` traduz < > & " ' para
 * entidade. Aqui não há HTML nenhum: o destino de cada valor é um parâmetro de
 * execução — caminho de arquivo, glob, URL, linha de comando. `noEscape`
 * desliga a tradução; sem ele um caminho como /home/o'brien chegaria ao pacote
 * como /home/o&#x27;brien, e uma URL com query string ganharia &amp; a cada
 * passagem (os params de endpoint passam por duas). */
const COMPILE_OPTIONS = { noEscape: true }

/* O modo `strict` não serve para renderizar: serve para PERGUNTAR se o template
 * resolveu. Nele o Handlebars lança quando a variável não existe no objeto de
 * params, em vez de render vazio — e é justamente essa a distinção que o texto
 * renderizado não carrega. "Resolveu para vazio" e "não resolveu" produzem o
 * mesmo "", mas pedem destinos opostos: o vazio é um valor herdado como
 * qualquer outro, enquanto o não-resolvido tem de continuar literal, para que o
 * {{VAR}} sobreviva até a camada que saiba respondê-lo. */
const STRICT_COMPILE_OPTIONS = { noEscape: true, strict: true }

const ResolveParamsByString = (source: any, metadata: any) => {

    const value = Handlebars.compile(source, COMPILE_OPTIONS)(metadata)

    /* Saída não vazia já é prova de resolução — e é o caminho de quase todo
     * template, então a segunda compilação nem chega a acontecer. */
    if(value !== ""){
        return { resolved: true, value }
    }

    try {
        Handlebars.compile(source, STRICT_COMPILE_OPTIONS)(metadata)
        return { resolved: true, value }
    } catch {
        return { resolved: false, value }
    }
}

module.exports = ResolveParamsByString
