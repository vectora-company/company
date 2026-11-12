# Instruções para agentes

Este repositório contém o site institucional e o dashboard proprietário da Vectora (`vectora.company`), feitos em TypeScript, React, TanStack Start/Router, Vite e Nitro. Não é o monorepo do produto desktop e não contém backend Python, Electron ou infraestrutura de armazenamento. `services.vectora.company` é uma dependência externa acessada por API, não um diretório deste repositório.

## Regras de trabalho

- Leia `README.md`, `CONTRIBUTING.md`, os scripts de `package.json` e os arquivos da área afetada antes de editar.
- Preserve a separação entre browser e server functions. Segredos e chamadas privadas ficam no servidor; nunca exponha segredos em `VITE_*` ou no bundle do navegador.
- Valide entradas e respostas da API com os schemas existentes. Mantenha tratamento explícito de erros e estados de carregamento e vazio.
- Funções de servidor em `src/server/fns/` encaminham operações por `src/lib/services/client.ts`; cookies de sessão são HttpOnly e tokens não devem ficar acessíveis ao JavaScript da página.
- Use Paraglide para texto de interface. Mantenha as traduções em `messages/{de,en,es,fr,it,pt,ru}.json` sincronizadas e ordenadas.
- Não presuma disponibilidade da API externa nos testes unitários. Cubra sucesso e erro com efeitos e contratos observáveis.
- Faça mudanças focadas. Não copie código ou instruções do produto desktop para este app.
- Não altere secrets, configuração de produção, contas externas ou dados reais sem solicitação explícita.

## Stack e comandos

- TypeScript, React, TanStack Start/Router, Vite e Nitro.
- Node.js 24 e pnpm 11.
- `pnpm dev` inicia o app local.
- Os comandos de qualidade são `pnpm run check`, `lint`, `typecheck`, `test` e `build`.
- `scons` (a partir da raiz) reúne os mesmos fluxos: `scons build`, `scons tests`, `scons coverage`, `scons lint`, `scons format`, `scons update`, `scons clean` e `scons prod` (deploy na Vercel; confere o link do projeto antes).
- `pre-commit run --all-files` executa os hooks versionados.

Execute os comandos pertinentes às mudanças e informe o resultado. Não apresente testes ignorados como aprovados.

Para alterações no processo de release, execute:

```bash
uv run --with pydantic --with pytest pytest utils/test_checks.py utils/test_release.py
```

## Pull requests e commits

- Use Conventional Commits.
- Respeite as linhas de release definidas em `.github/release-lines.json`: `release/0.2` com milestone `0.2` e `master` com milestone `0.1.x`.
- Não inclua no título ou na descrição detalhes de planejamento interno nem atribua a implementação a ferramentas de IA.
- Mudanças na interface devem incluir traduções em todos os idiomas disponíveis.
