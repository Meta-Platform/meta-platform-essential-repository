const path = require('path')

const SmartRequire = (moduleName) => {
    try{
        const basePath = process.env.EXTERNAL_NODE_MODULES_PATH || 'node_modules'
        const modulePath = path.join(basePath, moduleName)
        return require(modulePath)
    }catch(e){
        /* Deliberadamente `console`, e não `Log`: este módulo é carregado DURANTE a
         * construção do logger (o sink de terminal resolve o `colors` por aqui), e
         * usar `Log` criaria dependência circular — além de o logger ainda não
         * existir neste ponto. Ver logging-standard.md. */
        console.error(`Erro ao tentar carregar o ${moduleName}`)
        throw e
    }
    
}

module.exports = SmartRequire