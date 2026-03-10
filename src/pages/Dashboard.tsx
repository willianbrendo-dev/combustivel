import { useMemo } from "react";
import { Fuel, TrendingUp, Users, Droplets, LogOut, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAppData } from "@/contexts/AppDataContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { reservoirs, sales, transactions } = useAppData();

  const totalLitrosSold = useMemo(() => sales.reduce((s, sale) => s + sale.liters, 0), [sales]);
  const totalRevenue = useMemo(() => sales.reduce((s, sale) => s + sale.total, 0), [sales]);
  const uniqueClients = useMemo(() => new Set(sales.map((s) => s.client)).size, [sales]);

  const fuelTypes = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach((s) => { map[s.fuelType] = (map[s.fuelType] || 0) + s.liters; });
    const colors = ["hsl(46, 94%, 52%)", "hsl(218, 96%, 38%)", "hsl(220, 15%, 60%)", "hsl(142, 71%, 45%)"];
    return Object.entries(map).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  }, [sales]);

  const handleLogout = () => {
    localStorage.removeItem("fuelapp_auth");
    navigate("/");
  };

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between animate-fade-in">
        <div>
          <p className="text-xs text-muted-foreground">Bem-vindo de volta</p>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary glow-gold">
            <Fuel className="h-5 w-5 text-primary-foreground" />
          </div>
          <button onClick={handleLogout} className="flex h-10 w-10 items-center justify-center rounded-xl glass text-muted-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="mb-6 space-y-3 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        {[
          { label: "Receita Total", value: `R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: TrendingUp },
          { label: "Litros Vendidos", value: `${totalLitrosSold.toLocaleString()} L`, icon: Droplets },
          { label: "Clientes", value: String(uniqueClients), icon: Users },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="glass-card rounded-2xl p-4 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-lg font-bold text-foreground">{m.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fuel Type Distribution */}
      {fuelTypes.length > 0 && (
        <div className="mb-6 glass-card rounded-2xl p-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="mb-4 text-sm font-semibold text-foreground">Distribuição por Tipo</h2>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={fuelTypes} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={50} strokeWidth={0}>
                  {fuelTypes.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {fuelTypes.map((f) => (
                <div key={f.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: f.color }} />
                  <span className="text-xs text-muted-foreground flex-1">{f.name}</span>
                  <span className="text-xs font-semibold text-foreground">{f.value}L</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reservoirs */}
      {/* Reservatórios com alertas de perda */}
      <div className="glass-card rounded-2xl p-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <h2 className="mb-4 text-sm font-semibold text-foreground">Reservatórios</h2>
        <div className="space-y-4">
          {reservoirs.map((r) => {
            const pct = Math.round((r.currentLiters / r.capacity) * 100);
            const isLow = pct < 30;
            const loss = r.purchasedLiters - (r.currentLiters + r.soldLiters);
            const hasLoss = loss > 0.01;
            const lossValue = hasLoss ? loss * r.purchasePrice : 0;
            return (
              <div key={r.id}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{r.name}</span>
                  <span className={`text-xs ${isLow ? "text-destructive" : "text-muted-foreground"}`}>
                    {r.currentLiters.toLocaleString()}L / {r.capacity.toLocaleString()}L
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/50">
                  <div
                    className={`h-full rounded-full transition-all ${isLow ? "bg-destructive" : "bg-primary"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {hasLoss && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                    <span className="text-[11px] text-destructive font-medium">
                      Perda: {loss.toFixed(1)}L (R$ {lossValue.toFixed(2)})
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
