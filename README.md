# 📊 Araujo Embalagens — Sales Intelligence Dashboard

Projeto de **Business Intelligence desenvolvido em Power BI** para a Araujo Embalagens, com o objetivo de transformar o acompanhamento manual das vendas em um painel analítico, visual e centralizado.

O projeto foi planejado para fornecer à **diretoria e aos supervisores de vendas** uma visão confiável do desempenho comercial, permitindo acompanhar faturamento, evolução das vendas, metas, clientes, produtos, vendedores e equipes.

---

## 🎯 Objetivo do Projeto

Entregar um painel de Business Intelligence confiável e com atualização automática, substituindo o acompanhamento manual das vendas realizado por meio de planilhas.

O projeto contempla a construção de uma solução completa de BI, desde a conexão com a base de dados até a disponibilização dos indicadores no Power BI Service.

> **Fora do escopo nesta primeira fase:** produção, estoque e financeiro. Essas áreas estão previstas para uma possível segunda fase após a validação da base de vendas.

---

## 📌 Principais Indicadores

O dashboard foi planejado para apresentar os principais indicadores comerciais da empresa:

* 💰 Faturamento total
* 📈 Evolução mensal das vendas
* 📊 Comparação com o mesmo período do ano anterior
* 🎯 Meta versus realizado
* 👥 Vendas por vendedor
* 🏢 Vendas por equipe
* 🏆 Top 10 clientes
* 📦 Top 10 produtos
* 💵 Ticket médio
* 👤 Clientes ativos
* ⚠️ Clientes inativos
* 📈 Margem bruta
* 🔎 Curva ABC de clientes e produtos

## Os indicadores foram definidos a partir do Product Backlog do projeto.

## 📊 Dashboard

O painel foi pensado para oferecer uma visão executiva e operacional do desempenho de vendas.

### Visão geral

A página principal concentra os principais KPIs e gráficos:

* Faturamento total
* Crescimento em relação ao ano anterior
* Meta atingida
* Clientes ativos
* Ticket médio
* Evolução mensal das vendas
* Meta versus realizado
* Top 10 clientes
* Top 10 produtos
* Ranking de vendedores e equipes
* Clientes inativos

O layout prioriza uma leitura rápida dos principais indicadores e permite aprofundar a análise por meio de filtros e detalhamentos.

---

## 📈 Visualizações

### Evolução das vendas

Gráfico de linhas utilizado para acompanhar o faturamento ao longo dos meses e comparar o desempenho atual com o mesmo período do ano anterior.

### Top 10 clientes

Ranking dos maiores clientes considerando o faturamento e sua participação percentual no total de vendas.

### Top 10 produtos

Ranking dos produtos com maior participação no faturamento.

### Vendas por vendedor e equipe

Visualização do desempenho comercial individual e por equipe, considerando:

* Faturamento
* Quantidade de pedidos
* Ticket médio

### Meta x realizado

Comparação entre o valor realizado e a meta estabelecida para o período.

### Clientes inativos

Identificação de clientes que estão há determinado período sem realizar compras, permitindo que a equipe comercial acompanhe possíveis oportunidades de reativação.

---

# 🏗️ Arquitetura da Solução

A solução foi estruturada seguindo um fluxo de Business Intelligence:

```text
Base do Sistema
      │
      ▼
   Gateway
      │
      ▼
 Power Query
      │
      ▼
 Tratamento e
 Padronização
      │
      ▼
 Modelo em Estrela
      │
      ▼
 Medidas DAX
      │
      ▼
 Relatórios Power BI
      │
      ▼
 Power BI Service
```

A arquitetura prevê conexão de leitura com a base, tratamento dos dados através do Power Query, modelagem dimensional, criação das medidas e publicação dos relatórios no Power BI Service.

---

# 🗄️ Modelo de Dados

O projeto utiliza um **modelo dimensional em esquema estrela**, com uma tabela fato central e tabelas de dimensão para apoiar os filtros e análises.

### Tabelas de dimensão

```text
DIM_CLIENTE
DIM_PRODUTO
DIM_VENDEDOR
DIM_EQUIPE
DIM_CALENDARIO
```

### Tabelas fato

```text
FATO_VENDA
FATO_META
```

A tabela `FATO_VENDA` contempla informações como:

* ID do pedido
* ID do item
* Data da venda
* Quantidade
* Valor total
* Custo

A tabela `FATO_META` contempla:

* Mês
* Valor da meta

---

# 🔐 Segurança

O projeto prevê a utilização de **Row-Level Security (RLS)** para controlar o acesso às informações.

A diretoria terá acesso à visão completa dos dados, enquanto os supervisores visualizarão somente as informações relacionadas às suas respectivas equipes.

```text
Diretoria
   │
   └── Visão completa

Supervisor
   │
   └── Dados da própria equipe
```

A segurança por RLS será testada individualmente para os supervisores antes da publicação.

---

# 🔄 Atualização dos Dados

A solução foi planejada para trabalhar com atualização automática dos dados.

Fluxo previsto:

```text
Base de dados
      │
      ▼
Atualização agendada
      │
      ▼
Gateway
      │
      ▼
Power Query
      │
      ▼
Modelo Power BI
      │
      ▼
Power BI Service
```

O objetivo é permitir que os usuários consultem informações atualizadas sem depender de atualizações manuais de planilhas.

---

# 🧹 Tratamento dos Dados

O processo de ETL contempla:

1. Conexão com a base
2. Extração das tabelas
3. Limpeza dos dados
4. Padronização dos campos
5. Validação dos dados
6. Registro de inconsistências
7. Carregamento no modelo
8. Criação das medidas
9. Disponibilização dos indicadores

Inconsistências identificadas durante o processo devem ser registradas e encaminhadas para correção na origem.

---

# 🧮 Análises e Métricas

Entre as análises previstas estão:

### Faturamento

Acompanhamento do faturamento total e sua evolução ao longo do tempo.

### Crescimento

Comparação do desempenho atual com o mesmo período do ano anterior.

### Meta

Comparação entre o valor realizado e a meta definida.

### Desempenho comercial

Análise por:

* Vendedor
* Equipe
* Cliente
* Produto

### Clientes inativos

Identificação de clientes que não realizaram compras dentro de um período configurável.

### Margem bruta

Indicador previsto para a visão da diretoria, condicionado à existência dos dados de custo na base.

### Curva ABC

Análise avançada para classificação de clientes e produtos em categorias A, B e C.

---

# 🗂️ Product Backlog

O projeto foi organizado utilizando uma abordagem baseada em Scrum.

Os principais épicos são:

| Épico                     | Objetivo                                  |
| ------------------------- | ----------------------------------------- |
| 🗄️ Fundação de dados     | Conexão, tratamento e modelagem dos dados |
| 📊 Visão da diretoria     | Indicadores e análises executivas         |
| 👥 Visão dos supervisores | Acompanhamento da equipe de vendas        |
| 🚀 Entrega                | Publicação, acesso e treinamento          |
| 🔎 Análises avançadas     | Curva ABC e análises complementares       |

## O Product Backlog possui 14 PBIs inicialmente definidos, sendo sua ordem ajustável durante os processos de Refinement.

# 🏃 Sprints

O desenvolvimento foi planejado em Sprints de aproximadamente duas semanas.

### Sprint 0 — Descoberta

* Levantamento dos KPIs
* Definições de negócio
* Wireframes
* Acesso à base

### Sprint 1 — Dados

* Conexão com a base
* Tratamento dos dados
* Modelo dimensional

### Sprint 2 — Visão Executiva

* Faturamento
* Evolução das vendas
* Comparação anual
* Top clientes e produtos

### Sprint 3 — Supervisores

* Vendas por vendedor
* Vendas por equipe
* Publicação do dashboard

### Sprint 4 — Segurança e Adoção

* RLS
* Clientes inativos
* Treinamento dos usuários

---

# 🛠️ Tecnologias

* **Microsoft Power BI**
* **Power Query**
* **DAX**
* **Power BI Service**
* **Gateway**
* **Modelo dimensional / esquema estrela**
* **Row-Level Security (RLS)**

---

# 👨‍💻 Equipe

### Scrum Master

**Pedro Nicastro**

Responsável pela facilitação dos eventos Scrum e remoção de impedimentos.

### Developers

**Pedro Nicastro**

Responsável pela modelagem e desenvolvimento ativo do projeto.

### Product Owner

Representante da **Araujo Embalagens**

Responsável pelo Product Backlog, definição de prioridades e aceite dos incrementos.

### Stakeholders

Representantes da **Araujo Embalagens**, responsáveis pelo fornecimento de feedback para a evolução contínua do projeto.

---

# 📋 Definition of Done

Um incremento é considerado pronto quando:

* Os números foram conferidos com um relatório de referência da empresa;
* Os filtros e segmentações foram testados;
* O desempenho está aceitável;
* O Product Owner aceitou o incremento durante a Sprint Review.

---

# ⚠️ Dependências e Riscos

Alguns pontos dependem diretamente da disponibilidade e qualidade da base de dados:

* Liberação do acesso à base;
* Qualidade dos dados;
* Existência dos dados de custo;
* Existência das metas;
* Definição clara do conceito de "venda";
* Disponibilidade do Product Owner.

Esses pontos foram identificados no planejamento como dependências ou riscos do projeto.

---

# 📱 Publicação

O painel foi planejado para ser disponibilizado através do **Power BI Service**, permitindo acesso pela web e dispositivos móveis, com atualização agendada dos dados.

---

# 🚀 Status do Projeto

**Em desenvolvimento**

O projeto está sendo desenvolvido de forma incremental, passando pelas etapas de:

```text
Planejamento
    ↓
Levantamento de requisitos
    ↓
Modelagem de dados
    ↓
ETL
    ↓
Desenvolvimento dos dashboards
    ↓
Validação
    ↓
Segurança
    ↓
Publicação
```

---

## 📄 Documentação

A documentação do projeto contém:

* Arquitetura da solução
* Diagrama de casos de uso
* Diagrama de classes
* Modelo de dados
* Fluxos de comportamento
* Cronograma
* Product Backlog
* Sprints
* Definition of Ready
* Definition of Done
* Riscos e dependências

---

## 📌 Observação

Este repositório representa o desenvolvimento de uma solução de Business Intelligence para análise de vendas da Araujo Embalagens.

Os dados apresentados em protótipos e mockups podem ser **meramente ilustrativos**, quando utilizados para demonstrar o design e funcionamento dos dashboards. Os indicadores finais devem utilizar os dados disponibilizados pela empresa e validados conforme a Definition of Done do projeto.

---

## 📊 Visão do Projeto

```text
┌───────────────────────────────────────────────┐
│              ARAUJO EMBALAGENS                │
│           SALES INTELLIGENCE                  │
├───────────────────────────────────────────────┤
│ Faturamento │ Crescimento │ Meta │ Clientes  │
├───────────────────────────────────────────────┤
│                                               │
│          EVOLUÇÃO DAS VENDAS                 │
│          Atual × Ano Anterior                │
│                                               │
├───────────────────────┬───────────────────────┤
│   TOP CLIENTES        │   TOP PRODUTOS        │
│                       │                       │
├───────────────────────┴───────────────────────┤
│                                               │
│       VENDEDORES E EQUIPES                    │
│                                               │
├───────────────────────────────────────────────┤
│             CLIENTES INATIVOS                 │
└───────────────────────────────────────────────┘
```

**Araujo Embalagens — Transformando dados de vendas em informação para tomada de decisão.**
