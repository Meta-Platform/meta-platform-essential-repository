# Maintenance Toolkit CLI

### Perfis de Instalação

| **Perfil**                    | **Descrição**                                                                                      |
|-------------------------------|----------------------------------------------------------------------------------------------------|
| `dev-minimal-localfs`          | Configuração mínima, instalada no local de execução do comando, utilizando sistema de arquivo local |
| `dev-standard-localfs`         | Configuração padrão, instalada no local de execução do comando, utilizando sistema de arquivo local |
| `minimal-github-release`       | Configuração mínima, instala baixando do release hospedado no GitHub                               |
| `standard-github-release`      | Configuração padrão, instala baixando do release hospedado no GitHub                               |
| `minimal-github-repo`          | Configuração mínima, instala clonando do repositório do GitHub                                     |
| `standard-github-repo`         | Configuração padrão, instala clonando do repositório do GitHub                                     |
| `minimal-google-drive`         | Configuração mínima, instala baixando do Google Drive                                              |
| `standard-google-drive`        | Configuração padrão, instala baixando do Google Drive                                              |

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
