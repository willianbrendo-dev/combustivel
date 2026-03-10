import { useMemo } from "react";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useAppData } from "@/contexts/AppDataContext";
import { format } from "date-fns";

const Financial = () => {
  const navigate = useNavigate();
  const { transactions, reservoirs, sales } = useAppData();

  const totalEntradas = useMemo(() =>
    transactions.filter((t) => t.type === "entrada").reduce((s, t) => s + t.value, 0), [transactions]);
  
  const totalSaidas = useMemo(() =>
    transactions.filter((t) => t.type === "saida").reduce((s, t) => s + Math.abs(t.value), 0), [transactions]);

  const lucro = totalEntradas - totalSaidas;

  // Per-reservoir financial summary
  const reservoirSummary = useMemo(() =>
    reservoirs.map((r) => {
      const custo = r.purchasedLiters * r.purchasePrice;
      const arrecadado = r.soldLiters * r.salePrice;
      const expectedTotal = r.purchasedLiters * r.salePrice;
      const remaining = expectedTotal - arrecadado;
      return { ...r, custo, arrecadado, expectedTotal, remaining };
    }), [reservoirs]);

  // Simple monthly mock from transactions
  const chartData = useMemo(() => {
    const entradas = totalEntradas;
    const saidas = totalSaidas;
    return [
      { month: "Atual", entrada: entradas, saida: saidas },
    ];
  }, [totalEntradas, totalSaidas]);

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-6 flex items-center justify-between animate-fade-in">
        <div>
          <p className="text-xs text-muted-foreground">Acompanhe</p>
          <h1 className="text-xl font-bold text-foreground">Financeiro</h1>
        </div>
        <button
          onClick={() => navigate("/financeiro/relatorio")}
          className="flex items-center gap-1.5 rounded-xl glass-card px-3 py-2 text-xs font-semibold text-foreground transition-all active:scale-95"
        >
          <FileText className="h-4 w-4 text-primary" />
          Relatório
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="glass-card rounded-2xl p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-success/15">
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <p className="text-xs text-muted-foreground">Entradas</p>
          <p className="text-lg font-bold text-foreground">R$ {totalEntradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/15">
            <TrendingDown className="h-4 w-4 text-destructive" />
          </div>
          <p className="text-xs text-muted-foreground">Saídas</p>
          <p className="text-lg font-bold text-foreground">R$ {totalSaidas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Profit Card */}
      <div className="mb-6 glass-card rounded-2xl p-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
        <p className="text-xs text-muted-foreground">Lucro Líquido</p>
        <p className={`text-2xl font-bold ${lucro >= 0 ? "text-gradient-gold" : "text-destructive"}`}>
          R$ {lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Per-Reservoir Financial */}
      <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Controle por Reservatório</h2>
        <div className="space-y-3">
          {reservoirSummary.map((r) => (
            <div key={r.id} className="glass-card rounded-2xl p-4">
              <p className="text-sm font-semibold text-foreground mb-2">{r.name}</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Custo (compra)</span>
                  <span className="text-destructive font-semibold">R$ {r.custo.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Arrecadado ({r.soldLiters}L vendidos)</span>
                  <span className="text-success font-semibold">R$ {r.arrecadado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Meta total ({r.purchasedLiters}L)</span>
                  <span className="font-semibold text-foreground">R$ {r.expectedTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Falta arrecadar</span>
                  <span className="font-bold text-primary">R$ {r.remaining.toFixed(2)}</span>
                </div>
                {/* Progress towards goal */}
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted/50">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, (r.arrecadado / r.expectedTotal) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground text-right">
                  {((r.arrecadado / r.expectedTotal) * 100).toFixed(1)}% da meta
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="animate-fade-in" style={{ animationDelay: "0.25s" }}>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Movimentações</h2>
        <div className="space-y-2">
          {transactions.map((t) => (
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
                <p className="text-xs text-muted-foreground">{format(t.date, "dd/MM")}</p>
              </div>
              <p className={`text-sm font-bold shrink-0 ${
                t.type === "entrada" ? "text-success" : "text-destructive"
              }`}>
                {t.value > 0 ? "+" : ""}R$ {Math.abs(t.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Financial;
