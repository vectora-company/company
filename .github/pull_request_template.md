Descreva a mudança feita no site institucional, no dashboard ou na integração com os serviços da Vectora.

## Linha de release

Escolha uma base e uma milestone antes de solicitar revisão:

- `release/0.4` + milestone `0.4`: desenvolvimento da próxima minor.
- `master` + milestone `0.3.x`: manutenção da série `0.3`.

O CI exige uma milestone compatível com a branch base. PRs empilhados devem usar a milestone da base de destino.

## Checklist

- [ ] A base corresponde à linha de release pretendida.
- [ ] A milestone de release está atribuída e é compatível com a base.
- [ ] A mudança não depende de comportamento de API ainda não disponibilizado.
