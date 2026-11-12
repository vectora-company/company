# Contribuindo

Este repositório mantém o site institucional e a experiência de conta da Vectora. Antes de começar, escolha uma issue existente ou descreva o problema em uma nova issue; mudanças fora deste produto pertencem aos repositórios próprios do backend e dos serviços.

## Ambiente

Use Node.js 24 e pnpm 11, como no workflow de CI. Para executar validações de release, testes auxiliares e os hooks Python, instale também `uv` e `pre-commit`.

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Preencha apenas as variáveis necessárias ao cenário local. Não inclua segredos em issues, logs, capturas de tela ou commits.

## Qualidade

Antes de abrir a PR, rode os mesmos comandos do CI:

```bash
pnpm run check
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
pre-commit run --all-files
```

Ao corrigir um defeito, inclua uma regressão que falhe antes da correção e verifique o resultado visível ao usuário. Para mudanças de interface, considere estados vazio, carregando, erro e viewport móvel. Não use mocks para esconder erros de contrato entre o app e a API.

## Branches, commits e pull requests

Crie branches a partir da linha que receberá a mudança. Use Conventional Commits, por exemplo `fix: correct account error message`, `feat: add billing history filter` ou `docs: clarify local setup`.

Selecione a base e milestone correspondentes à linha:

- `release/0.2` com milestone `0.2` para mudanças destinadas à próxima minor.
- `master` com milestone `0.1.x` para manutenção da série estável.

O workflow valida a combinação. PRs empilhados devem apontar para a base real da stack e usar a milestone correspondente a essa base. O título e a descrição devem explicar o comportamento da mudança, sem referências a planejamento interno ou à ferramenta que a produziu.

Descreva o problema, a solução, os riscos e como validou. Não afirme que uma integração externa está funcionando se ela não foi exercitada. Não faça merge de sua própria PR.

## Release e versões

`.github/release-lines.json` é a fonte de branches, milestones e arquivos de versão. O script `utils/release.py` implementa o plano e a validação; não mantenha manifestos duplicados. Mudanças na política de release precisam atualizar os testes do script e o workflow correspondente.

## Licença e contribuições

O produto é proprietário. Não envie contribuição sem autorização para a mudança e sem acordo de contribuição aplicável. A equipe pode solicitar documentação de titularidade antes de aceitar código de terceiros.
