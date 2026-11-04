# 💰 Sistema de Gestão Financeira & Fluxo de Caixa

Um sistema web leve e modular desenvolvido em **HTML5, CSS3 e JavaScript** (Vanilla), projetado para gerenciar contas fixas, variáveis e o histórico detalhado de movimentações financeiras utilizando o armazenamento local do navegador (`localStorage`).

---

## 🚀 Funcionalidades Principais

* **Gestão de Contas (Cards):** Registo, visualização e controlo do estado de pagamento de contas fixas e variáveis/parceladas.
* **Integração Automática com o Fluxo de Caixa:** Ao dar baixa (clicar em "Pagar") numa conta, o sistema injeta automaticamente o registo correspondente (com nome original, valor e data) no histórico de saídas do Fluxo de Caixa.
* **Mapeamento Dinâmico de Títulos (`customTitlesMap`):** Conversão automática e padronização de chaves internas para rótulos legíveis e formatados (ex: `apartamento` ➔ `APARTAMENTO`).
* **Persistência Local (`localStorage`):** Dados salvos de forma segura e imediata no navegador do utilizador, sem necessidade de configuração complexa de base de dados em backend para a versão inicial.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5 / CSS3:** Estrutura e estilização responsiva das interfaces.
* **JavaScript (ES6+):** Lógica de manipulação do DOM, gestão de eventos e integração entre módulos.
* **Web Storage API (`localStorage`):** Armazenamento de dados do utilizador (`finance_contas_cadastradas_data` e `finance_fluxo_caixa_data`).
* **Git & GitHub:** Controlo de versão e hospedagem de código.

---

## 📂 Estrutura do Projeto

```text
finance/
│
├── index.html          # Página principal da aplicação
├── cards.js            # Módulo de gestão de contas e gatilhos de pagamento
├── fluxo-caixa.js      # Módulo de registo e exibição de entradas/saídas
├── style.css           # Folha de estilos global
└── README.md           # Documentação do projeto

https://vwaelectric.github.io/finance/