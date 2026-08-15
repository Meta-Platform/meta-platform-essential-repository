/** `@/foo.lib` → `foo.lib`. O namespace é como o pacote se identifica; o nome é
 * como ele aparece no disco e nos diretórios de execução. */
const ResolvePackageName = (namespace: string): string => namespace.replace('@/', '')
module.exports = ResolvePackageName
