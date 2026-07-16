// Tokeniza a string `commandLineArgs` em argv, no estilo do shell.
//
// Por que não entregar a string crua ao yargs: o `yargs-parser` aceita string,
// mas só remove as aspas de valores de OPÇÃO (stripQuotes em processValue). Os
// argumentos posicionais vão para `_` com as aspas literais, então
//
//     create "meu projeto"   ->   args.name === '"meu projeto"'
//
// chegava ao comando com as aspas dentro do valor. Tokenizando aqui, o yargs
// recebe um array já desaspado e trata posicionais e opções da mesma forma.
//
// Regras (subconjunto do shell POSIX):
//   - espaço em branco separa tokens;
//   - '...' preserva tudo literalmente, inclusive "\" e '"';
//   - "..." preserva espaços; \" e \\ são escapes;
//   - fora de aspas, "\" escapa o próximo caractere;
//   - aspas vazias produzem um token vazio ("" -> "").
const TokenizeArgs = (commandLineArgs) => {

    if(Array.isArray(commandLineArgs))
        return commandLineArgs.map((arg) => typeof arg === "string" ? arg : String(arg))

    if(typeof commandLineArgs !== "string")
        return []

    const tokens = []

    let current   = ""
    let hasToken  = false // distingue um token vazio ("") de "nenhum token"
    let quoteChar = null

    const _pushToken = () => {
        if(hasToken) tokens.push(current)
        current  = ""
        hasToken = false
    }

    for(let index = 0; index < commandLineArgs.length; index++){

        const character = commandLineArgs[index]

        if(quoteChar === "'"){
            if(character === "'") quoteChar = null
            else { current += character; hasToken = true }
            continue
        }

        if(quoteChar === "\""){
            if(character === "\\" && (commandLineArgs[index + 1] === "\"" || commandLineArgs[index + 1] === "\\")){
                current += commandLineArgs[++index]
                hasToken = true
            }
            else if(character === "\"") quoteChar = null
            else { current += character; hasToken = true }
            continue
        }

        if(character === "'" || character === "\""){
            quoteChar = character
            hasToken  = true // "" e '' são tokens vazios válidos
            continue
        }

        if(character === "\\" && index + 1 < commandLineArgs.length){
            current += commandLineArgs[++index]
            hasToken = true
            continue
        }

        if(/\s/.test(character)){
            _pushToken()
            continue
        }

        current += character
        hasToken = true
    }

    _pushToken()

    return tokens
}

module.exports = TokenizeArgs
