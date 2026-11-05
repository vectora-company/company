# Política de segurança

O site da Vectora inclui páginas públicas e fluxos autenticados de conta, licença e billing. Chamadas privadas à API passam pelas funções de servidor e pelo cliente em `src/lib/services/client.ts`; a API remota é responsável pelas operações de identidade, autorização e persistência.

## Escopo

Reporte vulnerabilidades que afetem este site, o dashboard, os cookies de sessão, a validação de entradas ou a comunicação com a API de serviços. Um problema exclusivamente no backend remoto deve também ser encaminhado ao responsável por esse serviço.

O site não deve colocar segredos em código client-side, variáveis `VITE_*`, URLs públicas, logs ou mensagens de erro. Não envie tokens, senhas, dados de pagamento ou dados pessoais em relatórios públicos.

## Como reportar

Use o canal privado de Security Advisories do GitHub para este repositório. Inclua o caminho/fluxo afetado, impacto, condições necessárias e uma reprodução mínima. Remova dados pessoais e credenciais. Não abra uma issue pública antes de coordenar a divulgação.

## Tratamento

A equipe confirmará o recebimento, avaliará a reprodução e o impacto, corrigirá o problema e coordenará a divulgação após haver uma mitigação disponível. Prazos de resposta ou suporte comercial não são garantidos por esta política.

## Versões

Priorize a versão de produção mais recente. A manutenção da série `0.3.x` e a próxima linha `0.4` seguem a configuração em `.github/release-lines.json`; a existência de uma branch não é, por si só, uma garantia de suporte ou SLA.
