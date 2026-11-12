# Deployment & GitHub Actions

## Pipeline (`company.yml`)

| Job           | Quando roda                                              | O que faz                                                       |
| ------------- | -------------------------------------------------------- | --------------------------------------------------------------- |
| `validate`    | todo PR e todo push                                      | hooks, testes dos utils, formatação, lint, tipos, testes, build |
| `deploy`      | push em `master`                                         | `vercel --prod` no Environment `Production`                     |
| `tag-release` | push em `master` de um commit `chore(master): release X` | tag, GitHub Release e rotação das linhas                        |

O `deploy` é pulado, sem falhar, quando `VERCEL_TOKEN` não existe. Nesse caso o
`tag-release` ainda roda num commit de release, então configure o token antes
da primeira release.

## Workflows de apoio

| Workflow                   | Função                                                                 |
| -------------------------- | ---------------------------------------------------------------------- |
| `release-please.yml`       | calcula a versão da linha e abre o PR de release com label e milestone |
| `rotate-release-lines.yml` | depois de uma release minor, promove a linha de desenvolvimento        |
| `forward-port-release.yml` | leva as correções da linha de manutenção para a de desenvolvimento     |
| `pr-release-milestone.yml` | valida e cria o milestone do PR conforme a base                        |
| `pr-checks.yml`            | título em Conventional Commits e metadados do PR                       |
| `pr-checks-comment.yml`    | comenta no PR o resultado de `pr-checks.yml`                           |
| `pr-labeler.yml`           | labels por caminho e por tipo de commit                                |

## Pré-requisitos do repositório

- **Settings → Actions → General → Workflow permissions:** marque "Allow GitHub
  Actions to create and approve pull requests". Sem isso o Release Please não
  consegue abrir o PR de release.
- **Label `autorelease: pending`:** criado pelo próprio workflow.
- **Milestones `0.1.x` e `0.2`:** o workflow `PR Release Milestone` cria o
  milestone da linha quando ele falta.
- **Branch `release/0.2`:** é a linha de desenvolvimento definida em
  `.github/release-lines.json`. Ela precisa existir de antemão; depois da
  primeira release minor a rotação passa a criar a próxima sozinha.

## Secrets

No Environment `Production` do GitHub:

- `VERCEL_TOKEN`

## Rollback

Promova um deploy anterior no painel da Vercel, ou reverta o commit no
`master` e deixe o pipeline publicar de novo.
