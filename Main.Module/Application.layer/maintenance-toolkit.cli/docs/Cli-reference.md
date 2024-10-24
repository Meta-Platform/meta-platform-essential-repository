# Maintenance Toolkit CLI

### Perfis de Instalação

| **Perfil**                    | **Descrição**                                                                                      |
|-------------------------------|----------------------------------------------------------------------------------------------------|
| `dev-localfs-minimal`          | Configuração mínima, instalada no local de execução do comando, utilizando sistema de arquivo local |
| `dev-localfs-standard`         | Configuração padrão, instalada no local de execução do comando, utilizando sistema de arquivo local |
| `github-release-minimal`       | Configuração mínima, instala baixando do release hospedado no GitHub                               |
| `github-release-standard`      | Configuração padrão, instala baixando do release hospedado no GitHub                               |
| `github-repo-minimal`          | Configuração mínima, instala clonando do repositório do GitHub                                     |
| `github-repo-standard`         | Configuração padrão, instala clonando do repositório do GitHub                                     |
| `google-drive-minimal`         | Configuração mínima, instala baixando do Google Drive                                              |
| `google-drive-standard`        | Configuração padrão, instala baixando do Google Drive                                              |

---

### Comandos Disponíveis

**Listar Perfis de Instalação Disponíveis**  
Comando: `mytoolkit list-profiles`

---

**Instalar Ecossistema**  
Comando: `mytoolkit install`

Opções:
- `--profile <nome_do_perfil>`  
- `--installation-path "<caminho_para_dados>"`

---
**Atualizar Ecossistema**  
Comando: `mytoolkit update`

Opções:
- `--profile <nome_do_perfil>`  
- `--installation-path "<caminho_para_dados>"`

---

**Exibir Detalhes de um Perfil**  
Comando: `mytoolkit show-profile --profile <nome_do_perfil>`
