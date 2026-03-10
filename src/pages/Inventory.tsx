import { useState } from "react";
import { Database, Plus, Droplets, DollarSign, Check, TrendingUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAppData } from "@/contexts/AppDataContext";

const Inventory = () => {
  const { reservoirs, addReservoir } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [currentLiters, setCurrentLiters] = useState("");
  const [purchased, setPurchased] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addReservoir({
      name,
      capacity: parseFloat(capacity),
      currentLiters: parseFloat(currentLiters || capacity),
      purchasedLiters: parseFloat(purchased),
      purchasePrice: parseFloat(purchasePrice),
      salePrice: parseFloat(salePrice),
    });
    toast.success(`Reservatório "${name}" cadastrado!`);
    setName(""); setCapacity(""); setCurrentLiters(""); setPurchased(""); setPurchasePrice(""); setSalePrice("");
    setShowForm(false);
  };

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-6 flex items-center justify-between animate-fade-in">
        <div>
          <p className="text-xs text-muted-foreground">Gerenciar</p>
          <h1 className="text-xl font-bold text-foreground">Estoque</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary glow-gold text-primary-foreground"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Add Reservoir Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 glass-card rounded-2xl p-4 space-y-4 animate-fade-in">
          <h2 className="text-sm font-semibold text-foreground">Novo Reservatório</h2>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Nome do combustível</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Ex: Gasolina Aditivada"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Capacidade (L)</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Litros atuais</label>
              <input
                type="number"
                value={currentLiters}
                onChange={(e) => setCurrentLiters(e.target.value)}
                className="w-full rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Litros comprados</label>
            <input
              type="number"
              value={purchased}
              onChange={(e) => setPurchased(e.target.value)}
              className="w-full rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="0"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Preço compra/L (R$)</label>
              <input
                type="number"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Preço venda/L (R$)</label>
              <input
                type="number"
                step="0.01"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="w-full rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Profit preview */}
          {purchasePrice && salePrice && purchased && (
            <div className="rounded-xl bg-primary/10 p-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Custo total</span>
                <span>Receita esperada</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-bold text-destructive">
                  R$ {(parseFloat(purchased) * parseFloat(purchasePrice)).toFixed(2)}
                </span>
                <span className="text-sm font-bold text-success">
                  R$ {(parseFloat(purchased) * parseFloat(salePrice)).toFixed(2)}
                </span>
              </div>
              <div className="mt-2 text-center">
                <span className="text-xs text-muted-foreground">Lucro esperado</span>
                <p className="text-base font-bold text-gradient-gold">
                  R$ {((parseFloat(salePrice) - parseFloat(purchasePrice)) * parseFloat(purchased)).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Check className="h-4 w-4" /> Cadastrar
          </button>
        </form>
      )}

      {/* Reservoirs List */}
      <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        {reservoirs.map((r) => {
          const pct = Math.round((r.currentLiters / r.capacity) * 100);
          const isLow = pct < 30;
          const expectedRevenue = r.purchasedLiters * r.salePrice;
          const actualRevenue = r.soldLiters * r.salePrice;
          const remainingRevenue = (r.purchasedLiters - r.soldLiters) * r.salePrice;
          const profit = r.soldLiters * (r.salePrice - r.purchasePrice);
          const lossLiters = r.purchasedLiters - r.soldLiters - r.currentLiters;

          return (
            <div key={r.id} className="glass-card rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15">
                    <Database className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.name}</p>
                    <span className={`text-xs font-medium ${isLow ? "text-destructive" : "text-success"}`}>
                      {isLow ? "Nível Baixo" : "Normal"}
                    </span>
                  </div>
                </div>
                <span className="text-lg font-bold text-foreground">{pct}%</span>
              </div>

              {/* Progress bar */}
              <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-muted/50">
                <div
                  className={`h-full rounded-full transition-all ${isLow ? "bg-destructive" : "bg-primary"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Volume details */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="rounded-xl bg-muted/30 p-2.5 text-center">
                  <Droplets className="mx-auto mb-1 h-4 w-4 text-secondary" />
                  <p className="text-[10px] text-muted-foreground">Atual</p>
                  <p className="text-xs font-bold text-foreground">{r.currentLiters.toLocaleString()}L</p>
                </div>
                <div className="rounded-xl bg-muted/30 p-2.5 text-center">
                  <Database className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground">Vendido</p>
                  <p className="text-xs font-bold text-foreground">{r.soldLiters.toLocaleString()}L</p>
                </div>
                <div className="rounded-xl bg-muted/30 p-2.5 text-center">
                  <DollarSign className="mx-auto mb-1 h-4 w-4 text-primary" />
                  <p className="text-[10px] text-muted-foreground">Compra/L</p>
                  <p className="text-xs font-bold text-foreground">R$ {r.purchasePrice.toFixed(2)}</p>
                </div>
              </div>

              {/* Financial tracking */}
              <div className="rounded-xl bg-muted/20 p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Venda/L</span>
                  <span className="font-semibold text-foreground">R$ {r.salePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Receita esperada</span>
                  <span className="font-semibold text-success">R$ {expectedRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Arrecadado</span>
                  <span className="font-semibold text-foreground">R$ {actualRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Lucro vendido</span>
                  <span className="font-bold text-gradient-gold">R$ {profit.toFixed(2)}</span>
                </div>

                {lossLiters > 0.1 && (
                  <div className="flex items-center gap-1.5 mt-1 rounded-lg bg-destructive/10 p-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                    <p className="text-[10px] text-destructive font-medium">
                      Perda detectada: {lossLiters.toFixed(1)}L (R$ {(lossLiters * r.salePrice).toFixed(2)})
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Inventory;
