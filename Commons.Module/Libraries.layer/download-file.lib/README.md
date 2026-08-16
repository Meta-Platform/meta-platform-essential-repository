# download-file.lib

- **Tipo:** biblioteca (`.lib`)
- **Namespace:** `@/download-file.lib`
- **Localização:** `Commons.Module/Libraries.layer/download-file.lib` (EssentialRepo)

## Propósito

Utilitários de **download de arquivos e binários** a partir das fontes
suportadas pela plataforma (URL direta, Google Drive e releases do GitHub).

## Exports (`src/`)

| Módulo | Responsabilidade |
|--------|------------------|
| `DownloadBinary.ts` | Baixa um binário/arquivo de uma URL. |
| `DownloadFileFromGoogleDrive.ts` | Baixa um arquivo do Google Drive por `fileId`. |
| `DownloadFirstAssetOfLatestReleaseFromGithub.ts` | Baixa o primeiro asset da release mais recente de um repositório GitHub. |
| `GetReleaseLatestData.ts` | Consulta os dados da *latest release* na API do GitHub. |

> Relaciona-se aos `sourceType` `GITHUB_RELEASE`/`GOOGLE_DRIVE` (ver
> [Meta Repository Standard](https://github.com/Meta-Platform/meta-platform-open-standard/blob/main/specifications/meta-repository-standard.md)).
> [README do repositório](../../../README.md)
