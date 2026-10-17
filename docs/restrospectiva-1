# Retrospectiva — Sprint 1

**Data:** 16/10/2026 · **Participantes:** Georg Herison, Yves Rêgo

## 1. Fatos

**Entregue**
- Protótipo, testes de caracterização (Vitest), módulos compartilhados e quatro features modularizadas (auth, painel, produção, eventos).
- Prática XP: refatoração de protótipo com testes passando antes e depois.

**Métricas de fluxo**

Lead time, cycle time, throughput e WIP não foram medidos de forma representativa. Os cartões das features foram criados e movidos ao fim da sprint, então qualquer valor calculado refletiria a data de criação dos cartões, não o ritmo real do trabalho.

**Problemas observados (com dados)**
- As issues #10 a #14 foram criadas ao fim da sprint, depois do trabalho feito. O quadro não refletiu corretamente o andamento ao longo da sprint.

**Prática XP — refatoração com testes de caracterização**
- Funcionou: o `App.tsx` foi refatorado sem nenhum teste, de modo que as features propostas foram modularizadas.
- Limite: os testes foram escritos depois do protótipo, não antes. Protegem o comportamento durante a refatoração, mas não guiaram o design (não é TDD).

## 2. Causas (5 Porquês)

**Problema principal: o quadro não refletiu o andamento real do trabalho ao longo da sprint.**
1. Por quê? Cartões foram criados e movidos ao final da sprint.
2. Por quê? Priorizamos terminar o código, e atualizar o quadro ficou para depois.
3. Por quê? Os planos de implementação mudaram durante a sprint, e atualizar o quadro a cada mudança parecia retrabalho.
4. Por quê? As dailies focaram no entregável e não conferiam o quadro.
5. Por quê? O acordo da Sprint 0 definiu limites de WIP, mas não um hábito de atualização do quadro.

## 3. Ações (máximo 3)

| Ação | Responsável | Prazo |
|------|-------------|-------|
| Commitar ao fim de cada sessão de trabalho | Georg e Yves | a partir de 19/10 |
| Atualizar o quadro no mesmo dia em que o cartão muda de estado e conferir o WIP (máx. 2 em "Em progresso") na Daily, para poder medir lead time e cycle time na Sprint 2 | Georg e Yves | a partir de 19/10; revisar em 23/11 |
| Configurar a pipeline de CI com GitHub Actions (build e testes, com gate em PR) | Yves | Sprint 2 (entrega em 30/11) |

## 4. Revisão do acordo de processo
Mudanças aplicadas em `docs/proposta.md`, seção 5:
- Commit no mesmo dia do trabalho.
- Refatorações só com testes de caracterização passando antes e depois.
- O quadro é atualizado no mesmo dia, e a Daily confere o WIP.
