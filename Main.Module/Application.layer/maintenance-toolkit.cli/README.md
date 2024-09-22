# Maintenance Toolkit command-line

O **Maintenance Toolkit** é uma ferramenta poderosa para configuração e instalação do ecossistema **Meta Platform**. Ele facilita a preparação e personalização da instalação, garantindo que todos os componentes essenciais do ecossistema estejam integrados e funcionando de maneira otimizada.

## Comandos Disponíveis

A seguir, estão listados os comandos disponíveis na ferramenta, junto com uma breve explicação e exemplos de uso para gerenciar diferentes aspectos do **Meta Platform**:

### Exibir Perfis de Instalação Disponíveis

Exibe as informações sobre os perfis de instalação disponíveis na ferramenta.

```bash
mytoolkit list profiles
```

### Instalar um Ecossistema na Pasta Padrão do Usuário

Instala o ecossistema na pasta de usuário padrão, utilizando o perfil de instalação **standard** por padrão.

```bash
mytoolkit install
# equivalente
mytoolkit install --profile standard

```

#### Exemplo:

### Exibir Detalhes de um Perfil

Exibe informações detalhadas sobre um perfil específico, como componentes incluídos e configurações recomendadas.

```bash
mytoolkit show profile nome_do_perfil
```

#### Exemplo:

```bash
mytoolkit show profile dev-standard
```

### Instalar com Perfis Específicos

Escolha o perfil de instalação desejado para ajustar a configuração do ecossistema de acordo com suas necessidades.

- **dev-minimal**: Ambiente de desenvolvimento com o mínimo de recursos.
- **dev-standard**: Ambiente de desenvolvimento com recursos padrão.
- **minimal**: Ambiente de produção com recursos mínimos.
- **standard**: Ambiente de produção com recursos completos.

```bash
mytoolkit install --profile nome_do_perfil
```

#### Exemplos:

```bash
mytoolkit install dev-minimal
mytoolkit install dev-standard
mytoolkit install minimal
mytoolkit install standard 
```

### Alterar o Caminho dos Dados de Instalação

Personalize o caminho onde o ecossistema será instalado especificando o diretório de dados.

```bash
mytoolkit install --installation-path "<caminho_para_dados>"
```

#### Exemplo:

```bash
mytoolkit install --installation-path "~/xpto/EcosystemData"
mytoolkit install dev-standard --data-path "~/xpto/EcosystemData"
```

### Usar um arquivo de profile especifico (xpto.install.json)

Personalize o caminho onde o ecossistema será instalado especificando o diretório de dados.

```bash
mytoolkit install --profile-file "<caminho_do_arquivo_de_perfil>"
```

#### Exemplo:

```bash
mytoolkit install --profile-path "~/xpto/custom.install.json"
```

## 

Os perfis de instalação permitem que você escolha a configuração mais adequada para o seu ambiente. Abaixo está uma lista dos perfis disponíveis:

- **dev-minimal**: Configuração mínima para desenvolvimento, com os componentes essenciais.
- **dev-standard**: Configuração padrão para desenvolvimento, incluindo ferramentas adicionais.
- **minimal**: Configuração mínima para produção, com apenas os componentes essenciais.
- **standard**: Configuração completa para produção, com todos os componentes integrados.

## Arquivo de instalação (.install.json)