# Deploy e GitHub Actions

## Pipeline (`company.yml`)

| Job        | Quando roda                                   | O que faz                                             |
| ---------- | --------------------------------------------- | ----------------------------------------------------- |
| `validate` | Todo PR e push                                | Hooks, testes auxiliares, lint, tipos, testes e build |
| `deploy`   | Push em `master`/`main` após `validate` verde | `scons prod` na Vercel                                |

O job de produção usa o Environment `Production`, serializa deploys e falha se
`VERCEL_TOKEN` estiver ausente. A configuração da organização e do projeto
Vercel é gerada no runner a partir dos identificadores versionados no workflow;
nenhum arquivo local `.vercel` precisa ser commitado. Deploy manual também é
limitado às branches `master` e `main`.

Configure `VERCEL_TOKEN` como secret do repositório ou do Environment
`Production`.

Não há milestones nem automação Release Please. O workflow não cria tags ou
GitHub Releases.

## Rollback

Promova um deploy anterior no painel da Vercel ou reverta o commit na branch
principal e deixe o pipeline publicar novamente.
