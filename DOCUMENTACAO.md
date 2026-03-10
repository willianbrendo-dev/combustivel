# 📋 Documentação do Sistema — FuelControl

**Versão:** 1.0  
**Data:** 10/03/2026  
**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Recharts

---

## 1. Visão Geral

O **FuelControl** é um sistema de gestão de postos de combustível focado em **controle quantitativo de reservatórios**, **registro de vendas**, **acompanhamento financeiro** e **detecção de perdas**. O objetivo é garantir que a operação gire com **100% de precisão** entre litros comprados, vendidos e em estoque.

---

## 2. Dados de Acesso

| Campo    | Valor             |
| -------- | ----------------- |
| **URL**  | `/` (tela de login) |
| **E-mail** | `admin@admin.com` |
| **Senha**  | `admin@321`       |

> ⚠️ A autenticação atual utiliza credenciais fixas com armazenamento em `localStorage` (`fuelapp_auth`). Recomenda-se migrar para autenticação via Lovable Cloud em produção.

---

## 3. Estrutura de Navegação

| Rota                     | Página           | Descrição                                      |
| ------------------------ | ---------------- | ---------------------------------------------- |
| `/`                      | Login            | Tela de autenticação                           |
| `/dashboard`             | Dashboard        | Métricas gerais, gráficos e nível dos reservatórios |
| `/vendas`                | Vendas           | Registro e histórico de vendas                 |
| `/financeiro`            | Financeiro       | Entradas, saídas, lucro e controle por reservatório |
| `/financeiro/relatorio`  | Relatório        | Filtros por período, download de relatório     |
| `/estoque`               | Estoque          | Cadastro e gestão de reservatórios             |

Todas as rotas (exceto `/`) são protegidas pelo componente `ProtectedRoute`, que verifica `localStorage("fuelapp_auth")`.

A navegação principal é feita via **barra inferior (island navigation)** com 4 itens: Início, Vendas, Financeiro, Estoque.

---

## 4. Arquitetura de Dados

### 4.1. Estado Centralizado (Context API)

Arquivo: `src/contexts/AppDataContext.tsx`

Todo o estado é gerenciado pelo `AppDataProvider`, que envolve todas as rotas e expõe:

| Dado           | Tipo             | Descrição                                |
| -------------- | ---------------- | ---------------------------------------- |
| `reservoirs`   | `Reservoir[]`    | Lista de reservatórios cadastrados       |
| `sales`        | `Sale[]`         | Lista de vendas realizadas               |
| `transactions` | `Transaction[]`  | Movimentações financeiras (auto-geradas) |
| `addReservoir` | Função           | Cadastra novo reservatório               |
| `addSale`      | Função           | Registra nova venda com validação        |

### 4.2. Interfaces de Dados

#### Reservoir (Reservatório)

```typescript
interface Reservoir {
  id: number;
  name: string;           // Nome do combustível (ex: "Gasolina Comum")
  capacity: number;       // Capacidade máxima em litros
  currentLiters: number;  // Litros atualmente em estoque
  purchasedLiters: number; // Total de litros comprados
  purchasePrice: number;  // Preço de compra por litro (R$)
  salePrice: number;      // Preço de venda por litro (R$)
  soldLiters: number;     // Total de litros vendidos
  createdAt: Date;        // Data de cadastro
}
```

#### Sale (Venda)

```typescript
interface Sale {
  id: number;
  client: string;         // Nome do cliente
  liters: number;         // Litros vendidos
  fuelType: string;       // Tipo de combustível
  reservoirId: number;    // ID do reservatório
  payment: string;        // Forma de pagamento
  pricePerLiter: number;  // Preço por litro no momento da venda
  total: number;          // Valor total (liters × pricePerLiter)
  date: Date;             // Data/hora da venda
}
```

#### Transaction (Movimentação Financeira)

```typescript
interface Transaction {
  id: number;
  desc: string;           // Descrição da movimentação
  value: number;          // Valor (positivo = entrada, negativo = saída)
  type: "entrada" | "saida";
  date: Date;
}
```

---

## 5. Regras de Negócio

### 5.1. Controle de Estoque e Perdas

A fórmula central de integridade é:

```
Perda = litros_comprados - (litros_vendidos + estoque_atual)
```

- Se `Perda > 0`: o sistema exibe alerta visual indicando a quantidade e o valor da perda.
- O valor da perda é calculado como: `Perda × preço_de_compra` (no Dashboard) e `Perda × preço_de_venda` (no Estoque e Relatório).
- Reservatórios com nível abaixo de **30%** recebem indicador visual de "Nível Baixo".

### 5.2. Validação de Vendas

Ao registrar uma venda, o sistema valida:

1. **Reservatório existe** → Erro: "Reservatório não encontrado."
2. **Litros > 0** → Erro: "Quantidade inválida."
3. **Litros ≤ estoque atual** → Erro: "Estoque insuficiente! Disponível: X.XL de [nome]."

Após validação bem-sucedida:
- O total é calculado automaticamente: `litros × preço_de_venda_do_reservatório`
- O estoque do reservatório é decrementado
- O contador de `soldLiters` é incrementado
- Uma nova entrada financeira é gerada automaticamente

### 5.3. Formas de Pagamento

O sistema suporta: **Dinheiro**, **PIX**, **Cartão Débito**, **Cartão Crédito**, **Fiado**.

### 5.4. Geração de Transações

As transações financeiras são **derivadas automaticamente** dos dados:

- **Saídas (despesas):** geradas a partir de cada reservatório → `litros_comprados × preço_compra`
- **Entradas (receitas):** geradas a partir de cada venda → `total da venda`

As transações são ordenadas por data decrescente.

---

## 6. Funcionalidades por Tela

### 6.1. Login (`/`)

- Formulário com e-mail e senha
- Toggle de visibilidade da senha
- Validação contra credenciais fixas
- Toast de erro em caso de falha
- Salva flag de autenticação no `localStorage`

### 6.2. Dashboard (`/dashboard`)

- **Métricas:** Receita Total, Litros Vendidos, Clientes únicos
- **Gráfico de pizza:** Distribuição de vendas por tipo de combustível
- **Reservatórios:** Barra de nível com percentual + **alerta de perda** quando detectada
- Botão de logout

### 6.3. Vendas (`/vendas`)

- **Formulário de nova venda:**
  - Seleção de cliente, litros, combustível (reservatório) e forma de pagamento
  - Preview do total antes de confirmar
  - Alerta visual de estoque insuficiente
  - Exibe litros disponíveis no reservatório selecionado
- **Histórico:** Lista de vendas recentes com cliente, litros, tipo, pagamento, valor e hora

### 6.4. Financeiro (`/financeiro`)

- **Cards resumo:** Total de entradas e saídas
- **Lucro líquido:** Diferença entre entradas e saídas
- **Controle por reservatório:**
  - Custo de aquisição
  - Valor arrecadado (litros vendidos × preço de venda)
  - Meta total (litros comprados × preço de venda)
  - Valor restante a arrecadar
  - Barra de progresso com percentual da meta
- **Movimentações:** Lista cronológica de todas as transações
- **Botão "Relatório":** Navega para tela de relatório detalhado

### 6.5. Relatório Financeiro (`/financeiro/relatorio`)

- **Filtros:** Data início, data fim, tipo (todos / entradas / saídas)
- **Resumo filtrado:** Entradas, saídas e saldo do período
- **Download:** Gera arquivo `.txt` com:
  - Período e filtro aplicado
  - Resumo financeiro
  - Controle detalhado por reservatório (incluindo perdas)
  - Lista completa de movimentações
- **Lista de movimentações** filtradas

### 6.6. Estoque (`/estoque`)

- **Formulário de novo reservatório:**
  - Nome, capacidade, litros atuais, litros comprados, preço de compra/L, preço de venda/L
  - Preview de custo total, receita esperada e lucro esperado
- **Lista de reservatórios:**
  - Barra de nível com percentual
  - Indicador de status (Normal / Nível Baixo)
  - Detalhes de volume: atual, vendido, preço de compra
  - Tracking financeiro: venda/L, receita esperada, arrecadado, lucro vendido
  - **Alerta de perda** com volume e valor quando detectada

---

## 7. Exemplo Prático de Gestão

### Cenário: Reservatório cadastrado em 09/03

| Campo              | Valor    |
| ------------------ | -------- |
| Capacidade         | 50L      |
| Litros atuais      | 40L      |
| Litros comprados   | 40L      |
| Preço compra/L     | R$ 5,22  |
| Preço venda/L      | R$ 6,50  |

**Cálculos esperados:**

| Métrica             | Fórmula                   | Resultado   |
| ------------------- | ------------------------- | ----------- |
| Custo total         | 40L × R$ 5,22             | R$ 208,80   |
| Receita esperada    | 40L × R$ 6,50             | **R$ 260,00** |
| Lucro esperado      | (R$ 6,50 - R$ 5,22) × 40 | R$ 51,20    |

Se ao final do mês foram vendidos apenas 38L e restam 1L no tanque:
- **Perda:** 40 - 38 - 1 = **1L**
- **Valor da perda:** 1L × R$ 5,22 = **R$ 5,22** (custo) ou 1L × R$ 6,50 = **R$ 6,50** (receita perdida)

---

## 8. Design System

### 8.1. Paleta de Cores (HSL)

| Token                | HSL                | Uso                         |
| -------------------- | ------------------ | --------------------------- |
| `--background`       | 224 40% 14%        | Fundo principal (navy escuro) |
| `--primary`          | 46 94% 52%         | Dourado (ações primárias)   |
| `--secondary`        | 218 96% 38%        | Azul (acentos)              |
| `--destructive`      | 0 84% 60%          | Vermelho (alertas, perdas)  |
| `--success`          | 145 63% 42%        | Verde (entradas, lucro)     |
| `--muted`            | 224 30% 22%        | Elementos neutros           |
| `--muted-foreground` | 220 15% 60%        | Texto secundário            |

### 8.2. Tipografia

- **Família:** Plus Jakarta Sans (300–800)
- **Títulos:** `text-xl font-bold`
- **Labels:** `text-xs text-muted-foreground`
- **Valores:** `text-lg font-bold`

### 8.3. Componentes Visuais

- **Glass Cards:** `glass-card` — fundo com gradiente translúcido + blur + borda sutil
- **Glass Strong:** `glass-strong` — versão mais opaca para navegação
- **Glow Gold:** `glow-gold` — sombra dourada para botões primários
- **Glow Blue:** `glow-blue` — sombra azul para navegação
- **Gradient Text:** `text-gradient-gold` — texto com gradiente dourado

---

## 9. Tecnologias e Dependências Principais

| Tecnologia        | Versão  | Uso                                    |
| ----------------- | ------- | -------------------------------------- |
| React             | 18.3    | Framework de UI                        |
| TypeScript        | –       | Tipagem estática                       |
| Vite              | –       | Build e dev server                     |
| Tailwind CSS      | –       | Estilização utility-first              |
| React Router DOM  | 6.30    | Roteamento SPA                         |
| Recharts          | 2.15    | Gráficos (pizza, área)                 |
| date-fns          | 3.6     | Formatação de datas                    |
| Lucide React      | 0.462   | Ícones                                 |
| Sonner            | 1.7     | Notificações toast                     |
| Radix UI          | –       | Componentes acessíveis (popover, calendar, etc.) |

---

## 10. Limitações Atuais

1. **Sem persistência:** Dados são armazenados em memória (state React). Ao recarregar a página, os dados voltam ao estado inicial.
2. **Autenticação básica:** Credenciais fixas no código-fonte, sem criptografia.
3. **Relatório em .txt:** O download gera arquivo texto, não PDF real.
4. **Usuário único:** Não há sistema de múltiplos usuários ou perfis de acesso.
5. **Sem reabastecimento:** Não é possível adicionar litros a um reservatório já cadastrado.

---

## 11. Recomendações de Evolução

1. **Lovable Cloud:** Conectar banco de dados para persistência de reservatórios, vendas e transações.
2. **Autenticação real:** Migrar para auth com Lovable Cloud (e-mail/senha, Google).
3. **PDF real:** Usar biblioteca como `jsPDF` para gerar relatórios em PDF.
4. **Reabastecimento:** Permitir adicionar litros com atualização do custo médio.
5. **Multi-usuário:** Implementar perfis (admin, operador, gerente) com permissões distintas.
6. **Alertas automáticos:** Notificações push quando nível cair abaixo de 20%.
7. **Histórico de perdas:** Registrar e categorizar perdas (evaporação, vazamento, furto).

---

## 12. Estrutura de Arquivos

```
src/
├── App.tsx                        # Rotas e providers
├── main.tsx                       # Ponto de entrada
├── index.css                      # Design system (tokens CSS)
├── contexts/
│   └── AppDataContext.tsx          # Estado centralizado
├── components/
│   ├── AppLayout.tsx              # Layout com navegação inferior
│   ├── NavLink.tsx                # Componente de link
│   └── ui/                        # Componentes shadcn/ui
├── pages/
│   ├── Login.tsx                  # Autenticação
│   ├── Dashboard.tsx              # Painel principal
│   ├── Sales.tsx                  # Gestão de vendas
│   ├── Financial.tsx              # Controle financeiro
│   ├── FinancialReport.tsx        # Relatório com filtros
│   ├── Inventory.tsx              # Gestão de estoque
│   └── NotFound.tsx               # Página 404
└── hooks/
    ├── use-mobile.tsx             # Detecção mobile
    └── use-toast.ts               # Hook de notificações
```
