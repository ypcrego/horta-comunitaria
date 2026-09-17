# Proposta do Projeto - App Horta Comunitária

## 1. Visão do Produto
Para coordenadores e voluntários de hortas comunitárias   
Que enfrentam dificuldades na comunicação descentralizada e na sobrecarga de gestão de materiais    
O App Horta Comunitária é um aplicativo móvel de gestão e colaboração    
Que centraliza o manejo de canteiros, o controle de estoque e a comunicação em uma plataforma única    
Diferente de fluxos baseados em grupos de WhatsApp e planilhas manuais isoladas    
Nosso produto promove o engajamento contínuo através de um fórum integrado e mapeamento interativo dos setores ecológicos.    

## 2. Definição do MVP
O MVP focará em estabelecer a fundação do processo de engenharia e as funcionalidades essenciais de gestão.

| No MVP | Fora do MVP |
|---|---|
| Autenticação com controle de acesso (Coordenador e Voluntário) | Versão Desktop |
| Mapeamento de canteiros e registro de histórico de plantio | Módulo educativo e integração com sensores IoT |
| Módulo básico de estoque para solicitação de ferramentas | Gamificação complexa (sistema de XP e níveis) |
| Fórum integrado para comunicação geral da horta | Acervo de imagens e memórias de longo prazo |

**Hipótese de valor:** Acreditamos que coordenadores e voluntários vão registrar atividades com mais frequência e diminuir a perda de ferramentas porque terão um ambiente unificado, reduzindo a dependência de planilhas manuais.

## 3. Backlog Inicial
O backlog priorizado e estimado encontra-se no GitHub Projects do repositório:
(https://github.com/users/ypcrego/projects/1)

## 4. Stack Tecnológico e Justificativa
* **Frontend:** Flutter/Dart.
* **Backend:** PostgreSQL no DB + Stack a definir no backend
* **Justificativa:** A stack backend fortemente tipada e relacional garante robustez para a modelagem da horta e viabiliza a configuração de testes automatizados e pipelines de Integração Contínua (CI) exigidos no processo. O Flutter viabiliza o cliente mobile.

## 5. Acordo de Processo
* **Cadência:** Sprints de 2 semanas. Planejamento às segundas-feiras; Review e Retrospectiva às sextas-feiras da segunda semana.
* **Cerimônias:** 
  * *Planning:* 1h no início da sprint.
  * *Daily:* Assíncrona via WhatsApp (o que fiz, o que farei, impedimentos).
  * *Review & Retrospectiva:* 1h no último dia da sprint.
* **Definição de Pronto (DoD):** Código mergeado em `main` sem conflitos; Pipeline de CI verde (Build e Testes passando); Revisão de código aprovada.
* **Papéis:** Equipe multifuncional (ambos atuam como desenvolvedores e PO). A revisão de código é obrigatoriamente cruzada (quem abre o Pull Request não aprova o próprio PR).
* **Ferramentas:** GitHub (Repositório, Kanban, Actions), WhatsApp (Dailies).
* **WIP Limits:** Máximo de 2 itens em "Em progresso" e 2 itens em "Em revisão".

## 6. Equipe
* Georg Nunes - Matrícula: 20260001606 - Papel: Desenvolvedor / Revisor
* Yves Rêgo - Matrícula: 20260001769 - Papel: Desenvolvedor / Revisor

## 7. Coorte
**Coorte:** B - Online
