# maintenance-toolkit.cli

- **Tipo:** aplicação de linha de comando (`.cli`)
- **Namespace:** `@/maintenance-toolkit.cli`
- **Executável:** `mytoolkit`
- **Localização:** `Main.Module/Application.layer/maintenance-toolkit.cli` (EssentialRepo)

## Propósito

O **Maintenance Toolkit Command-line** é uma ferramenta usada para configuração e instalação de ecossistemas **Meta Platform**. Ele facilita a preparação e personalização da instalação, garantindo que todos os componentes essenciais do ecossistema estejam integrados e funcionando de maneira otimizada.

## Perfis de Instalação

Os perfis abaixo são os que possuem arquivo em `src/InstallationProfiles/`:

- **localfs-minimal** Configuração mínima, instalada no diretório *home*, usando o sistema de arquivo local como fonte
- **localfs-standard** Configuração padrão, instalada no diretório *home*, usando o sistema de arquivo local como fonte
- **localfs-full** Configuração completa, instalada no diretório *home*, usando o sistema de arquivo local como fonte
- **dev-localfs-minimal** Configuração mínima, instalada no local de execução do comando e não do diretório *home*, usando o sistema de arquivo local como fonte
- **dev-localfs-standard** Configuração padrão, instalada no local de execução do comando e não do diretório *home*, usando o sistema de arquivo local como fonte
- **dev-localfs-full** Configuração completa, instalada no local de execução do comando e não do diretório *home*, usando o sistema de arquivo local como fonte
- **github-release-minimal** Configuração mínima, instala baixando do release hospedada no github
- **github-release-standard** Configuração padrão, instala baixando do release hospedada no github
- **google-drive-minimal** Configuração mínima, instala baixando do google drive
- **google-drive-standard** Configuração padrão, instala baixando do google drive

> **Issue conhecido (código):** o loader de perfis (`src/Helpers/LoadAllInstalationProfiles.ts`) referencia os perfis `github-repo-minimal` e `github-repo-standard`, cujos arquivos **não existem** em `src/InstallationProfiles/`. Como o `require` é feito de forma imediata, os comandos `list-profiles`, `install` e `update` atualmente quebram com `MODULE_NOT_FOUND` até que esses arquivos sejam criados ou as referências removidas.

## Comandos Disponíveis
### Exibir Perfis de Instalação Disponíveis
Exibe as informações sobre os perfis de instalação disponíveis na ferramenta.

```bash
mytoolkit list-profiles
```

### Instalar um Ecossistema
Instala o ecossistema conforme o perfil de instalação informado. **Não há perfil padrão**: o perfil é obrigatório (executar `mytoolkit install` sem perfil resulta em erro).

```bash
mytoolkit install <nome_do_perfil>
```

#### Exemplo:
```bash
mytoolkit install github-release-standard
```

Também é possível informar um arquivo de perfil próprio com a opção `--profile-file "<caminho_do_arquivo>"` (opção declarada em `metadata/command-group.json`; atualmente os handlers de `install`/`update` ainda não a consomem — issue conhecido).

### Atualizar um Ecossistema
Atualiza um ecossistema já instalado, conforme o perfil informado (também obrigatório).

```bash
mytoolkit update <nome_do_perfil>
```

### Exibir Detalhes de um Perfil
Exibe informações detalhadas sobre um perfil específico, como componentes incluídos e configurações recomendadas.

```bash
mytoolkit show profile <nome_do_perfil>
```

> **Issue conhecido (código):** este comando está quebrado no momento — o handler (`src/Commands/ShowProfileInfo.command.ts`) referencia perfis inexistentes (`dev-minimal`, `dev-standard`, `minimal`, `standard`) via `require` imediato, o que faz o comando falhar com `MODULE_NOT_FOUND` para qualquer perfil informado.

### Instalar com Perfis Específicos
Escolha o perfil de instalação desejado para ajustar a configuração do ecossistema de acordo com suas necessidades.

```bash
mytoolkit install "<nome_do_perfil>"
```

#### Exemplos:
```bash
mytoolkit install localfs-minimal
mytoolkit install localfs-standard
mytoolkit install dev-localfs-minimal
mytoolkit install dev-localfs-standard
mytoolkit install github-release-minimal
mytoolkit install github-release-standard
```

### Alterar o Caminho dos Dados de Instalação
Personalize o caminho onde o ecossistema será instalado especificando o diretório de dados.

```bash
mytoolkit install --installation-path "<caminho_para_dados>"
```

#### Exemplo:
```bash
mytoolkit install --installation-path "~/xpto/EcosystemData"
```

Os perfis de instalação permitem que você escolha a configuração mais adequada para o seu ambiente. A lista completa de perfis está na seção [Perfis de Instalação](#perfis-de-instalação) acima.
