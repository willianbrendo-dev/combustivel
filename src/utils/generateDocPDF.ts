import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateDocPDF = () => {
  const doc = new jsPDF();
  let y = 20;

  const title = (text: string) => {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 69);
    doc.text(text, 14, y);
    y += 8;
  };

  const subtitle = (text: string) => {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text(text, 14, y);
    y += 6;
  };

  const body = (text: string) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(text, 180);
    lines.forEach((line: string) => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(line, 14, y);
      y += 4.5;
    });
    y += 2;
  };

  const tableEnd = () => { y = (doc as any).lastAutoTable.finalY + 10; };

  // ========== CAPA ==========
  doc.setFillColor(30, 41, 69);
  doc.rect(0, 0, 210, 297, "F");
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(230, 190, 50);
  doc.text("FuelControl", 105, 100, { align: "center" });
  doc.setFontSize(16);
  doc.setTextColor(200, 200, 220);
  doc.text("Documentação do Sistema", 105, 115, { align: "center" });
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 170);
  doc.text("Versão 1.0 — Março 2026", 105, 135, { align: "center" });
  doc.text("Gestão de Combustível e Controle de Reservatórios", 105, 145, { align: "center" });

  // ========== 1. VISÃO GERAL ==========
  doc.addPage();
  y = 20;
  title("1. Visão Geral");
  body("O FuelControl é um sistema de gestão de postos de combustível focado em controle quantitativo de reservatórios, registro de vendas, acompanhamento financeiro e detecção de perdas. O objetivo é garantir que a operação gire com 100% de precisão entre litros comprados, vendidos e em estoque.");
  body("Stack: React 18 + TypeScript + Vite + Tailwind CSS + Recharts");

  // ========== 2. DADOS DE ACESSO ==========
  y += 4;
  title("2. Dados de Acesso");

  autoTable(doc, {
    startY: y,
    head: [["Campo", "Valor"]],
    body: [
      ["URL", "/ (tela de login)"],
      ["E-mail", "admin@admin.com"],
      ["Senha", "admin@321"],
    ],
    theme: "grid",
    headStyles: { fillColor: [30, 41, 69], textColor: 255 },
    styles: { fontSize: 9 },
    margin: { left: 14 },
  });
  tableEnd();

  body("⚠ A autenticação atual utiliza credenciais fixas com armazenamento em localStorage. Recomenda-se migrar para autenticação via Lovable Cloud em produção.");

  // ========== 3. ESTRUTURA DE NAVEGAÇÃO ==========
  y += 4;
  title("3. Estrutura de Navegação");

  autoTable(doc, {
    startY: y,
    head: [["Rota", "Página", "Descrição"]],
    body: [
      ["/", "Login", "Tela de autenticação"],
      ["/dashboard", "Dashboard", "Métricas gerais, gráficos e nível dos reservatórios"],
      ["/vendas", "Vendas", "Registro e histórico de vendas"],
      ["/financeiro", "Financeiro", "Entradas, saídas, lucro e controle por reservatório"],
      ["/financeiro/relatorio", "Relatório", "Filtros por período, download de relatório"],
      ["/estoque", "Estoque", "Cadastro e gestão de reservatórios"],
    ],
    theme: "grid",
    headStyles: { fillColor: [30, 41, 69], textColor: 255 },
    styles: { fontSize: 8 },
    margin: { left: 14 },
  });
  tableEnd();

  body("Todas as rotas (exceto /) são protegidas pelo componente ProtectedRoute, que verifica localStorage. A navegação principal é feita via barra inferior (island navigation) com 4 itens: Início, Vendas, Financeiro, Estoque.");

  // ========== 4. ARQUITETURA DE DADOS ==========
  doc.addPage();
  y = 20;
  title("4. Arquitetura de Dados");
  subtitle("4.1 Estado Centralizado (Context API)");
  body("Arquivo: src/contexts/AppDataContext.tsx — Todo o estado é gerenciado pelo AppDataProvider, que envolve todas as rotas.");

  autoTable(doc, {
    startY: y,
    head: [["Dado", "Tipo", "Descrição"]],
    body: [
      ["reservoirs", "Reservoir[]", "Lista de reservatórios cadastrados"],
      ["sales", "Sale[]", "Lista de vendas realizadas"],
      ["transactions", "Transaction[]", "Movimentações financeiras (auto-geradas)"],
      ["addReservoir", "Função", "Cadastra novo reservatório"],
      ["addSale", "Função", "Registra nova venda com validação"],
    ],
    theme: "grid",
    headStyles: { fillColor: [30, 41, 69], textColor: 255 },
    styles: { fontSize: 8 },
    margin: { left: 14 },
  });
  tableEnd();

  subtitle("4.2 Interface Reservoir");
  autoTable(doc, {
    startY: y,
    head: [["Campo", "Tipo", "Descrição"]],
    body: [
      ["id", "number", "Identificador único"],
      ["name", "string", "Nome do combustível"],
      ["capacity", "number", "Capacidade máxima em litros"],
      ["currentLiters", "number", "Litros atualmente em estoque"],
      ["purchasedLiters", "number", "Total de litros comprados"],
      ["purchasePrice", "number", "Preço de compra por litro (R$)"],
      ["salePrice", "number", "Preço de venda por litro (R$)"],
      ["soldLiters", "number", "Total de litros vendidos"],
      ["createdAt", "Date", "Data de cadastro"],
    ],
    theme: "grid",
    headStyles: { fillColor: [30, 41, 69], textColor: 255 },
    styles: { fontSize: 8 },
    margin: { left: 14 },
  });
  tableEnd();

  subtitle("4.3 Interface Sale");
  autoTable(doc, {
    startY: y,
    head: [["Campo", "Tipo", "Descrição"]],
    body: [
      ["id", "number", "Identificador único"],
      ["client", "string", "Nome do cliente"],
      ["liters", "number", "Litros vendidos"],
      ["fuelType", "string", "Tipo de combustível"],
      ["reservoirId", "number", "ID do reservatório"],
      ["payment", "string", "Forma de pagamento"],
      ["pricePerLiter", "number", "Preço por litro no momento da venda"],
      ["total", "number", "Valor total (liters × pricePerLiter)"],
      ["date", "Date", "Data/hora da venda"],
    ],
    theme: "grid",
    headStyles: { fillColor: [30, 41, 69], textColor: 255 },
    styles: { fontSize: 8 },
    margin: { left: 14 },
  });
  tableEnd();

  subtitle("4.4 Interface Transaction");
  autoTable(doc, {
    startY: y,
    head: [["Campo", "Tipo", "Descrição"]],
    body: [
      ["id", "number", "Identificador único"],
      ["desc", "string", "Descrição da movimentação"],
      ["value", "number", "Valor (positivo = entrada, negativo = saída)"],
      ["type", '"entrada" | "saida"', "Tipo da movimentação"],
      ["date", "Date", "Data da movimentação"],
    ],
    theme: "grid",
    headStyles: { fillColor: [30, 41, 69], textColor: 255 },
    styles: { fontSize: 8 },
    margin: { left: 14 },
  });
  tableEnd();

  // ========== 5. REGRAS DE NEGÓCIO ==========
  doc.addPage();
  y = 20;
  title("5. Regras de Negócio");

  subtitle("5.1 Controle de Estoque e Perdas");
  body("Fórmula central de integridade:");
  body("Perda = litros_comprados - (litros_vendidos + estoque_atual)");
  body("• Se Perda > 0: o sistema exibe alerta visual indicando quantidade e valor da perda.");
  body("• O valor da perda é calculado como: Perda × preço_de_compra (Dashboard) e Perda × preço_de_venda (Estoque/Relatório).");
  body("• Reservatórios com nível abaixo de 30% recebem indicador visual de 'Nível Baixo'.");

  subtitle("5.2 Validação de Vendas");
  body("Ao registrar uma venda, o sistema valida:");
  body("1. Reservatório existe → Erro: 'Reservatório não encontrado.'");
  body("2. Litros > 0 → Erro: 'Quantidade inválida.'");
  body("3. Litros ≤ estoque atual → Erro: 'Estoque insuficiente! Disponível: X.XL de [nome].'");
  body("Após validação bem-sucedida: o total é calculado automaticamente (litros × preço_de_venda), o estoque é decrementado, o contador de soldLiters é incrementado e uma nova entrada financeira é gerada.");

  subtitle("5.3 Formas de Pagamento");
  body("Dinheiro, PIX, Cartão Débito, Cartão Crédito, Fiado.");

  subtitle("5.4 Geração de Transações");
  body("As transações financeiras são derivadas automaticamente:");
  body("• Saídas (despesas): geradas a partir de cada reservatório → litros_comprados × preço_compra");
  body("• Entradas (receitas): geradas a partir de cada venda → total da venda");
  body("As transações são ordenadas por data decrescente.");

  // ========== 6. FUNCIONALIDADES POR TELA ==========
  doc.addPage();
  y = 20;
  title("6. Funcionalidades por Tela");

  subtitle("6.1 Login (/)");
  body("• Formulário com e-mail e senha com toggle de visibilidade\n• Validação contra credenciais fixas\n• Toast de erro em caso de falha\n• Salva flag de autenticação no localStorage");

  subtitle("6.2 Dashboard (/dashboard)");
  body("• Métricas: Receita Total, Litros Vendidos, Clientes únicos\n• Gráfico de pizza: Distribuição de vendas por tipo de combustível\n• Reservatórios: Barra de nível com percentual + alerta de perda quando detectada\n• Botão de logout");

  subtitle("6.3 Vendas (/vendas)");
  body("• Formulário de nova venda: seleção de cliente, litros, combustível e pagamento\n• Preview do total antes de confirmar\n• Alerta visual de estoque insuficiente\n• Exibe litros disponíveis no reservatório selecionado\n• Histórico: Lista de vendas recentes");

  subtitle("6.4 Financeiro (/financeiro)");
  body("• Cards resumo: Total de entradas e saídas\n• Lucro líquido: Diferença entre entradas e saídas\n• Controle por reservatório: custo, arrecadado, meta, falta arrecadar, barra de progresso\n• Lista cronológica de movimentações\n• Botão 'Relatório' para tela detalhada");

  subtitle("6.5 Relatório Financeiro (/financeiro/relatorio)");
  body("• Filtros: Data início, data fim, tipo (todos / entradas / saídas)\n• Resumo filtrado: Entradas, saídas e saldo do período\n• Download PDF com resumo, controle por reservatório e movimentações\n• Lista de movimentações filtradas");

  subtitle("6.6 Estoque (/estoque)");
  body("• Formulário: Nome, capacidade, litros atuais, comprados, preço compra/venda\n• Preview de custo total, receita esperada e lucro esperado\n• Lista com barra de nível, status, volumes, tracking financeiro e alerta de perda");

  // ========== 7. EXEMPLO PRÁTICO ==========
  doc.addPage();
  y = 20;
  title("7. Exemplo Prático de Gestão");
  body("Cenário: Reservatório cadastrado em 09/03 com 40L, compra a R$ 5,22/L, venda a R$ 6,50/L.");

  autoTable(doc, {
    startY: y,
    head: [["Métrica", "Fórmula", "Resultado"]],
    body: [
      ["Custo total", "40L × R$ 5,22", "R$ 208,80"],
      ["Receita esperada", "40L × R$ 6,50", "R$ 260,00"],
      ["Lucro esperado", "(R$ 6,50 - R$ 5,22) × 40", "R$ 51,20"],
    ],
    theme: "grid",
    headStyles: { fillColor: [30, 41, 69], textColor: 255 },
    styles: { fontSize: 9 },
    margin: { left: 14 },
  });
  tableEnd();

  body("Se ao final do mês foram vendidos 38L e restam 1L no tanque:");
  body("• Perda: 40 - 38 - 1 = 1L");
  body("• Valor da perda: 1L × R$ 5,22 = R$ 5,22 (custo) ou 1L × R$ 6,50 = R$ 6,50 (receita perdida)");

  // ========== 8. DESIGN SYSTEM ==========
  y += 6;
  title("8. Design System");

  autoTable(doc, {
    startY: y,
    head: [["Token", "HSL", "Uso"]],
    body: [
      ["--background", "224 40% 14%", "Fundo principal (navy escuro)"],
      ["--primary", "46 94% 52%", "Dourado (ações primárias)"],
      ["--secondary", "218 96% 38%", "Azul (acentos)"],
      ["--destructive", "0 84% 60%", "Vermelho (alertas, perdas)"],
      ["--success", "145 63% 42%", "Verde (entradas, lucro)"],
      ["--muted", "224 30% 22%", "Elementos neutros"],
    ],
    theme: "grid",
    headStyles: { fillColor: [30, 41, 69], textColor: 255 },
    styles: { fontSize: 8 },
    margin: { left: 14 },
  });
  tableEnd();

  body("Tipografia: Plus Jakarta Sans (300-800). Componentes visuais: glass-card, glass-strong, glow-gold, glow-blue, text-gradient-gold.");

  // ========== 9. TECNOLOGIAS ==========
  y += 4;
  title("9. Tecnologias e Dependências");

  autoTable(doc, {
    startY: y,
    head: [["Tecnologia", "Versão", "Uso"]],
    body: [
      ["React", "18.3", "Framework de UI"],
      ["TypeScript", "—", "Tipagem estática"],
      ["Vite", "—", "Build e dev server"],
      ["Tailwind CSS", "—", "Estilização utility-first"],
      ["React Router DOM", "6.30", "Roteamento SPA"],
      ["Recharts", "2.15", "Gráficos (pizza, área)"],
      ["date-fns", "3.6", "Formatação de datas"],
      ["jsPDF", "—", "Geração de PDF"],
      ["Lucide React", "0.462", "Ícones"],
      ["Sonner", "1.7", "Notificações toast"],
    ],
    theme: "grid",
    headStyles: { fillColor: [30, 41, 69], textColor: 255 },
    styles: { fontSize: 8 },
    margin: { left: 14 },
  });
  tableEnd();

  // ========== 10. LIMITAÇÕES E EVOLUÇÃO ==========
  doc.addPage();
  y = 20;
  title("10. Limitações Atuais");
  body("1. Sem persistência: Dados em memória, resetam ao recarregar.");
  body("2. Autenticação básica: Credenciais fixas no código-fonte.");
  body("3. Usuário único: Sem múltiplos perfis de acesso.");
  body("4. Sem reabastecimento: Não é possível adicionar litros a reservatório existente.");

  y += 4;
  title("11. Recomendações de Evolução");
  body("1. Lovable Cloud: Banco de dados para persistência.");
  body("2. Autenticação real: Auth com e-mail/senha ou Google.");
  body("3. Reabastecimento: Adicionar litros com custo médio atualizado.");
  body("4. Multi-usuário: Perfis admin, operador, gerente.");
  body("5. Alertas automáticos: Notificações quando nível < 20%.");
  body("6. Histórico de perdas: Registrar e categorizar (evaporação, vazamento, furto).");

  // ========== 12. ESTRUTURA DE ARQUIVOS ==========
  y += 6;
  title("12. Estrutura de Arquivos");
  body("src/App.tsx — Rotas e providers");
  body("src/contexts/AppDataContext.tsx — Estado centralizado");
  body("src/components/AppLayout.tsx — Layout com navegação inferior");
  body("src/pages/Login.tsx — Autenticação");
  body("src/pages/Dashboard.tsx — Painel principal");
  body("src/pages/Sales.tsx — Gestão de vendas");
  body("src/pages/Financial.tsx — Controle financeiro");
  body("src/pages/FinancialReport.tsx — Relatório com filtros");
  body("src/pages/Inventory.tsx — Gestão de estoque");

  // Footer on last page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`FuelControl — Documentação do Sistema — Página ${i} de ${pageCount}`, 105, 290, { align: "center" });
  }

  doc.save("FuelControl-Documentacao-Sistema.pdf");
};
