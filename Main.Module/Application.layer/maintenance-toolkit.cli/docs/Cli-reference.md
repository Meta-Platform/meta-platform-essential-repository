# Maintenance Toolkit CLI

### Perfis de Instalação

Perfis com arquivo em `src/InstallationProfiles/`:

| **Perfil**                    | **Descrição**                                                                                        |
|-------------------------------|------------------------------------------------------------------------------------------------------|
| `localfs-minimal`              | Configuração mínima, instalada no diretório *home*, utilizando sistema de arquivo local              |
| `localfs-standard`             | Configuração padrão, instalada no diretório *home*, utilizando sistema de arquivo local              |
| `localfs-full`                 | Configuração completa, instalada no diretório *home*, utilizando sistema de arquivo local            |
| `dev-localfs-minimal`          | Configuração mínima, instalada no local de execução do comando, utilizando sistema de arquivo local  |
| `dev-localfs-standard`         | Configuração padrão, instalada no local de execução do comando, utilizando sistema de arquivo local  |
| `dev-localfs-full`             | Configuração completa, instalada no local de execução do comando, utilizando sistema de arquivo local|
| `github-release-minimal`       | Configuração mínima, instala baixando do release hospedado no GitHub                                 |
| `github-release-standard`      | Configuração padrão, instala baixando do release hospedado no GitHub                                 |
| `google-drive-minimal`         | Configuração mínima, instala baixando do Google Drive                                                |
| `google-drive-standard`        | Configuração padrão, instala baixando do Google Drive                                                |

> **Issue conhecido (código):** o loader de perfis (`src/Helpers/LoadAllInstalationProfiles.js`) ainda referencia `github-repo-minimal` e `github-repo-standard`, que não possuem arquivo em `src/InstallationProfiles/`. Isso faz `list-profiles`, `install` e `update` falharem com `MODULE_NOT_FOUND` no estado atual do código.

---

### Comandos Disponíveis

**Listar Perfis de Instalação Disponíveis**  
Comando: `mytoolkit list-profiles`

---

**Instalar Ecossistema**  
Comando: `mytoolkit install [profile]`

O perfil é um argumento **posicional** (ex.: `mytoolkit install localfs-standard`) e é obrigatório na prática — não há perfil padrão.

Opções:
- `--profile-file "<caminho_do_arquivo>"` — endereço de um arquivo de perfil de instalação (declarada em `metadata/command-group.json`; o handler atual ainda não a consome — issue conhecido)
- `--installation-path "<caminho_para_dados>"` — local onde a plataforma será instalada

---
**Atualizar Ecossistema**  
Comando: `mytoolkit update [profile]`

O perfil é um argumento **posicional** (ex.: `mytoolkit update localfs-standard`) e é obrigatório na prática — não há perfil padrão.

Opções:
- `--profile-file "<caminho_do_arquivo>"` — endereço de um arquivo de perfil de instalação (declarada em `metadata/command-group.json`; o handler atual ainda não a consome — issue conhecido)
- `--installation-path "<caminho_para_dados>"` — local onde a plataforma será atualizada

---

**Exibir Detalhes de um Perfil**  
Comando: `mytoolkit show profile [profile]`

O perfil é um argumento **posicional** (ex.: `mytoolkit show profile localfs-standard`).

> **Issue conhecido (código):** o handler (`src/Commands/ShowProfileInfo.command.js`) referencia perfis inexistentes (`dev-minimal`, `dev-standard`, `minimal`, `standard`) via `require` imediato; o comando atualmente falha com `MODULE_NOT_FOUND` para qualquer perfil.
