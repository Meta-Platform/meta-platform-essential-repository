[Meta Platform Essential Repository](../../../README.md) / [Main Module](../../README.md)

# Maintenance Toolkit Command-line

O **Maintenance Toolkit Command-line** é uma ferramenta usada para configuração e instalação de ecossistemas **Meta Platform**. Ele facilita a preparação e personalização da instalação, garantindo que todos os componentes essenciais do ecossistema estejam integrados e funcionando de maneira otimizada.

## Perfis de Instalação

- **dev-minimal-localfs** Configuração mínima, instalada no local de execução do comando e não do diretório *home*, usando o sistema de arquivo local como fonte
- **dev-standard-localfs** Configuração padrão, instalada no local de execução do comando e não do diretório *home*, usando o sistema de arquivo local como fonte
- **minimal-github-release** Configuração mínima, instala baixando do release hospedada no github
- **standard-github-release** Configuração padrão, instala baixando do release hospedada no github
- **minimal-github-repo** Configuração mínima, instala clonando do repositório do github
- **standard-github-repo** Configuração padrão, instala clonando do repositório do github
- **minimal-google-drive** Configuração mínima, instala baixando do google drive
- **standard-google-drive** Configuração padrão, instala baixando do google drive

## Comandos Disponíveis
### Exibir Perfis de Instalação Disponíveis
Exibe as informações sobre os perfis de instalação disponíveis na ferramenta.

```bash
mytoolkit list-profiles
```

### Instalar um Ecossistema na Pasta Padrão do Usuário
Instala o ecossistema na pasta de usuário padrão, utilizando o perfil de instalação **standard** por padrão.

```bash
mytoolkit install
```

#### Exemplo:
```bash
mytoolkit install --profile standard-github-release
```

### Exibir Detalhes de um Perfil
Exibe informações detalhadas sobre um perfil específico, como componentes incluídos e configurações recomendadas.

```bash
mytoolkit show-profile --profile <nome_do_perfil>
```

#### Exemplo:
```bash
mytoolkit show-profile --profile dev-standard
```

### Instalar com Perfis Específicos
Escolha o perfil de instalação desejado para ajustar a configuração do ecossistema de acordo com suas necessidades.

```bash
mytoolkit install --profile "<nome_do_perfil>"
```

#### Exemplos:
```bash
mytoolkit install --profile dev-minimal-localfs
mytoolkit install --profile dev-standard-localfs
mytoolkit install --profile minimal-github-release
mytoolkit install --profile standard-github-release
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

Os perfis de instalação permitem que você escolha a configuração mais adequada para o seu ambiente. Abaixo está uma lista dos perfis disponíveis:


