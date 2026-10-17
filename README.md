# App Horta Comunitária - DIM0510 (Processos de Software)

**Equipe:**
- Georg Herison Maia Nunes (Matrícula: 20260001606 | GitHub: [Erigeo](https://github.com/Erigeo))
- Yves Rêgo (Matrícula: 20260001769 | GitHub: [ypcrego](https://github.com/ypcrego))

**Coorte:** B - Online

## Resumo
Repositório destinado à disciplina de Processos de Software. O foco deste projeto é aplicar práticas de engenharia de software (Integração Contínua, Kanban, Revisão de código e Métricas DORA) em um aplicativo de gestão de hortas comunitárias.

## Entregas Sprint 0
- [Proposta do Projeto](docs/proposta.md)
- [Quadro Kanban](https://github.com/users/ypcrego/projects/1)
- [Vídeo de Apresentação](https://drive.google.com/file/d/1wHzmSL-1D7iDGf4SEYK8pQOc51yhWb7s/view?usp=drive_link)

## Entregas Sprint 1
- Incremento: protótipo da horta modularizado em `src/features/*` e `src/shared/*`, com testes de caracterização.
- [Quadro Kanban](https://github.com/users/ypcrego/projects/1)
- [Retrospectiva 01](docs/retrospectiva-01.md)
- [Vídeo da Sprint 1](https://drive.google.com/file/d/1hdA38-KrGc8l4fvo7gj-1uLCanjATNtN/view?usp=drive_link)

## Como rodar
Pré-requisitos: Node 22 e pnpm 10 (versões em `.mise.toml`).

```bash
pnpm install
pnpm dev      # servidor de desenvolvimento
pnpm test     # testes (Vitest)
pnpm build    # build de produção
```

Logins de demonstração (dados mock, sem banco de dados):

| Perfil | E-mail | Senha |
|---|---|---|
| Coordenador | coordenador@ufrn.br | senha123 |
| Voluntário | voluntario@ufrn.br | senha123 |

O que esperar: o Coordenador cadastra produção (em kg) e agenda eventos. O Voluntário apenas visualiza, com o aviso de "somente leitura".

## Estrutura
```
src/
  features/   auth, dashboard, production, events
  shared/     types, constants, utils, components
  App.tsx     composição (navegação e sessão)
```

## Prática XP da Sprint 1
**Refatoração com testes de caracterização.** Os testes de `src/App.test.tsx` foram escritos sobre o protótipo monolítico antes da modularização e passam sem alteração depois dela. Os dois PRs de refatoração descrevem isso.

## Checklist da Sprint 1
- [ ] Incremento funcional em main
- [ ] Kanban com WIP limits configurados
- [ ] Evidência de prática XP
- [ ] docs/retrospectiva-01.md com ações
- [ ] Vídeo 5 min
