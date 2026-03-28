# Install Nodejs Package Dependencies 

Instala as dependências de um pacote Node.js em um diretório específico.

**Parâmetros:**
- `namespace` (string): Identificador único do pacote (ex: `"@/service-orchestrator.app"`)
- `path` (string): Caminho completo da pasta do pacote
- `environmentPath` (string): Caminho do ambiente de execução
- `EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES` (string): Nome do diretório de dependências (ex: `".dependencies"`)

**Exemplo no execution params:**
```json
{
  "objectLoaderType": "install-nodejs-package-dependencies",
  "staticParameters": {
    "namespace": "@/service-orchestrator.app",
    "path": "/home/kadisk/EcosystemData/repos/KADISKCorpRepo/VirtualDesk.Module/PlatformApplications.layer/service-orchestrator.app",
    "environmentPath": "/home/kadisk/EcosystemData/environments/service-orchestrator.app-0d0885c5971916f98cc8359d4a308f0a916e24d83bf29340fc5c111a2a775d6a",
    "EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES": ".dependencies"
  }
}
```
