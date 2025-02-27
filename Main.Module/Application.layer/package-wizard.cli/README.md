[Meta Platform Essential Repository](../../../README.md) / [Main Module](../../README.md)


# Package Wizard Command-line

O **Package Wizard Command-line** é uma ferramenta criada para a criação, atualização, edição de de pacotes compativeis com a plataforma **Meta Platform** 

## Comandos Disponíveis


```bash
mypkg create --name "example-teste" --type "webservice"

# Metadados
mypkg show metadata startup-params
mypkg edit metadata startup-params

# Webservices
mypkg create api "NewExample"
mypkg create controller "NewExample"
mypkg create endpoint

# Webgui
mypkg create container NewContainer
mypkg create page NewPage
mypkg create add route

```

- mostra informações do pacote
- Criar um novo pacote
        - Escolher tipo do pacote
        - Preencher campos dos repositórios
    - Criar um grupo
- Criar um novo serviço
- listar serviços
- criar controller