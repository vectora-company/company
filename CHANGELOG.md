# Changelog

## [0.1.0] (2026-11-06)

Primeira versão da Company, o site institucional e o painel de conta, assinatura e cobrança de `vectora.company`. Todas as entradas abaixo são novidades desta versão.

### Features

- site: página inicial, funcionalidades, roadmap, FAQ, suporte e downloads do Vectora
- site: páginas legais de termos, privacidade, cookies, DPA e SLA
- site: sitemap, imagens de compartilhamento geradas sob demanda e renderização no servidor
- i18n: site e painel em sete idiomas (português, inglês, espanhol, francês, alemão, italiano e russo), com tradução compilada pelo Paraglide
- auth: cadastro e login, verificação de e-mail e autorização do app desktop por código de dispositivo
- dashboard: painel da conta com dados de perfil
- dashboard: assinatura e cobrança, com checkout e portal de pagamento
- dashboard: gestão de licença e do token de uso do Vectora
- dashboard: chaves de API
- dashboard: configuração do Vectora Bot para GitHub Actions
- issues: abertura, listagem e acompanhamento de tickets de suporte
- admin: área restrita para cupons, presentes e triagem de tickets
- integração com o Services: chamadas privadas feitas apenas por funções no servidor, sem expor segredos ao navegador
- observabilidade: rastreamento de erros com Sentry no cliente e no servidor
- tooling: verificações e release em `utils/`, linhas de release e milestones, rótulos e validações de PR
- ci: workflows de testes, build, deploy, Release Please e verificações de PR
