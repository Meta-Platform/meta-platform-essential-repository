# download-file.lib

- **Tipo:** biblioteca (`.lib`) · **Namespace:** `@/download-file.lib`

Utilitários de **download de arquivos e binários** a partir das fontes
suportadas pela plataforma (URL direta, Google Drive e releases do GitHub).

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `DownloadBinary.js` | Baixa um binário/arquivo de uma URL. |
| `DownloadFileFromGoogleDrive.js` | Baixa um arquivo do Google Drive por `fileId`. |
| `DownloadFirstAssetOfLatestReleaseFromGithub.js` | Baixa o primeiro asset da release mais recente de um repositório GitHub. |
| `GetReleaseLatestData.js` | Consulta os dados da *latest release* na API do GitHub. |

> Relaciona-se aos `sourceType` `GITHUB_RELEASE`/`GOOGLE_DRIVE` (ver
> [Meta Repository Standard](../../../../../Meta-Platform/meta-platform-open-standard/specifications/meta-repository-standard.md)).
> [README do repositório](../../../README.md)
