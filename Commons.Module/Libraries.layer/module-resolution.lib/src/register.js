/* Deliberadamente JavaScript, e permanentemente — ver ResolveTypeScriptPath.js. */

/* Ponto de entrada para `node --require`, usado pelos testes:
 *
 *     node --require <este arquivo> --test
 *
 * Existe separado de InstallTypeScriptResolution.js para que carregar aquele
 * módulo não instale nada por efeito colateral: lá se pega a função, aqui se
 * pede a instalação. */

require("./InstallTypeScriptResolution")()
