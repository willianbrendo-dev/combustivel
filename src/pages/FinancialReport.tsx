import { useState } from "react";
import { ArrowLeft, Download, Filter, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAppData } from "@/contexts/AppDataContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type FilterType = "todos" | "entrada" | "saida";

const FinancialReport = () => {
  const navigate = useNavigate();
  const { transactions, reservoirs } = useAppData();
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(2025, 2, 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(2025, 2, 31));
  const [filterType, setFilterType] = useState<FilterType>("todos");

  const filtered = transactions.filter((t) => {
    const matchType = filterType === "todos" || t.type === filterType;
    const matchStart = !startDate || t.date >= startDate;
    const matchEnd = !endDate || t.date <= endDate;
    return matchType && matchStart && matchEnd;
  });

  const totalEntradas = filtered.filter(t => t.type === "entrada").reduce((s, t) => s + t.value, 0);
  const totalSaidas = filtered.filter(t => t.type === "saida").reduce((s, t) => s + Math.abs(t.value), 0);

  const handleDownloadPDF = () => {
    const period = `${startDate ? format(startDate, "dd/MM/yyyy") : "—"} a ${endDate ? format(endDate, "dd/MM/yyyy") : "—"}`;
    const doc = new jsPDF();
    let y = 20;

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("FuelControl - Relatório Financeiro", 14, y);
    y += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Período: ${period}`, 14, y);
    y += 5;
    doc.text(`Filtro: ${filterType === "todos" ? "Todos" : filterType === "entrada" ? "Entradas" : "Saídas"}`, 14, y);
    y += 5;
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, y);
    y += 12;

    // Summary
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo Financeiro", 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [["Métrica", "Valor (R$)"]],
      body: [
        ["Total Entradas", totalEntradas.toFixed(2)],
        ["Total Saídas", totalSaidas.toFixed(2)],
        ["Saldo", (totalEntradas - totalSaidas).toFixed(2)],
      ],
      theme: "grid",
      headStyles: { fillColor: [30, 41, 69], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // Reservoirs
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Controle por Reservatório", 14, y);
    y += 2;

    const reservoirRows = reservoirs.map((r) => {
      const custo = r.purchasedLiters * r.purchasePrice;
      const receita = r.soldLiters * r.salePrice;
      const meta = r.purchasedLiters * r.salePrice;
      const perda = r.purchasedLiters - r.soldLiters - r.currentLiters;
      return [
        r.name,
        `${r.purchasedLiters}L`,
        `R$ ${r.purchasePrice.toFixed(2)}`,
        `R$ ${custo.toFixed(2)}`,
        `${r.soldLiters}L`,
        `R$ ${receita.toFixed(2)}`,
        `R$ ${meta.toFixed(2)}`,
        `${r.currentLiters.toFixed(1)}L`,
        perda > 0.1 ? `${perda.toFixed(1)}L (R$ ${(perda * r.salePrice).toFixed(2)})` : "—",
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [["Combustível", "Comprado", "Preço/L", "Custo", "Vendido", "Arrecadado", "Meta", "Estoque", "Perda"]],
      body: reservoirRows,
      theme: "grid",
      headStyles: { fillColor: [30, 41, 69], textColor: 255, fontSize: 7 },
      styles: { fontSize: 7 },
      margin: { left: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // Check page space
    if (y > 240) { doc.addPage(); y = 20; }

    // Transactions
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(`Movimentações (${filtered.length})`, 14, y);
    y += 2;

    const txRows = filtered.map((t) => [
      format(t.date, "dd/MM/yyyy"),
      t.type === "entrada" ? "Entrada" : "Saída",
      t.desc,
      `${t.value > 0 ? "+" : ""}R$ ${Math.abs(t.value).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Data", "Tipo", "Descrição", "Valor"]],
      body: txRows,
      theme: "grid",
      headStyles: { fillColor: [30, 41, 69], textColor: 255 },
      styles: { fontSize: 8 },
      margin: { left: 14 },
    });

    doc.save(`relatorio-fuelcontrol-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const DateButton = ({ label, date, onSelect }: { label: string; date?: Date; onSelect: (d: Date | undefined) => void }) => (
    <Popover>
      <PopoverTrigger asChild>
        <button className="glass-card rounded-xl px-3 py-2.5 text-left flex-1">
          <p className="text-[10px] text-muted-foreground">{label}</p>
          <p className="text-xs font-semibold text-foreground">
            {date ? format(date, "dd/MM/yyyy") : "Selecionar"}
          </p>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          locale={pt}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-5 flex items-center gap-3 animate-fade-in">
        <button onClick={() => navigate("/financeiro")} className="flex h-9 w-9 items-center justify-center rounded-xl glass-card">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <div>
          <p className="text-xs text-muted-foreground">Financeiro</p>
          <h1 className="text-xl font-bold text-foreground">Relatório</h1>
        </div>
      </div>

      <div className="mb-4 flex gap-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <DateButton label="Data início" date={startDate} onSelect={setStartDate} />
        <DateButton label="Data fim" date={endDate} onSelect={setEndDate} />
      </div>

      <div className="mb-5 flex gap-2 animate-fade-in" style={{ animationDelay: "0.15s" }}>
        {(["todos", "entrada", "saida"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-semibold transition-all",
              filterType === f ? "bg-primary text-primary-foreground shadow-lg" : "glass-card text-muted-foreground"
            )}
          >
            {f === "todos" ? "Todos" : f === "entrada" ? "Entradas" : "Saídas"}
          </button>
        ))}
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="glass-card rounded-2xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Entradas</p>
          <p className="text-sm font-bold text-success">R$ {totalEntradas.toFixed(2)}</p>
        </div>
        <div className="glass-card rounded-2xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Saídas</p>
          <p className="text-sm font-bold text-destructive">R$ {totalSaidas.toFixed(2)}</p>
        </div>
        <div className="glass-card rounded-2xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Saldo</p>
          <p className="text-sm font-bold text-gradient-gold">R$ {(totalEntradas - totalSaidas).toFixed(2)}</p>
        </div>
      </div>

      <button
        onClick={handleDownloadPDF}
        className="mb-5 w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-all active:scale-[0.98] animate-fade-in"
        style={{ animationDelay: "0.25s" }}
      >
        <Download className="h-4 w-4" />
        Baixar Relatório
      </button>

      <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Movimentações ({filtered.length})</h2>
        {filtered.length === 0 ? (
          <div className="glass-card rounded-2xl p-6 text-center">
            <Filter className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nenhuma movimentação encontrada</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((t) => (
              <div key={t.id} className="glass-card rounded-2xl p-4 flex items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  t.type === "entrada" ? "bg-success/15" : "bg-destructive/15"
                }`}>
                  {t.type === "entrada"
                    ? <ArrowUpRight className="h-4 w-4 text-success" />
                    : <ArrowDownRight className="h-4 w-4 text-destructive" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{t.desc}</p>
                  <p className="text-xs text-muted-foreground">{format(t.date, "dd/MM/yyyy")}</p>
                </div>
                <p className={`text-sm font-bold shrink-0 ${
                  t.type === "entrada" ? "text-success" : "text-destructive"
                }`}>
                  {t.value > 0 ? "+" : ""}R$ {Math.abs(t.value).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialReport;
