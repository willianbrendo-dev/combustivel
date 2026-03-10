import { useState } from "react";
import { ShoppingCart, Plus, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAppData } from "@/contexts/AppDataContext";
import { format } from "date-fns";

const paymentMethods = ["Dinheiro", "PIX", "Cartão Débito", "Cartão Crédito", "Fiado"];

const Sales = () => {
  const { reservoirs, sales, addSale } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [client, setClient] = useState("");
  const [liters, setLiters] = useState("");
  const [selectedReservoirId, setSelectedReservoirId] = useState<number>(reservoirs[0]?.id ?? 0);
  const [payment, setPayment] = useState("PIX");

  const selectedReservoir = reservoirs.find((r) => r.id === selectedReservoirId);
  const previewTotal = selectedReservoir && liters ? (parseFloat(liters) * selectedReservoir.salePrice) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = await addSale({
      client,
      liters: parseFloat(liters),
      reservoirId: selectedReservoirId,
      payment,
    });
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(`Venda de ${liters}L registrada para ${client}!`);
    setClient("");
    setLiters("");
    setShowForm(false);
  };

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-6 flex items-center justify-between animate-fade-in">
        <div>
          <p className="text-xs text-muted-foreground">Registrar</p>
          <h1 className="text-xl font-bold text-foreground">Vendas</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary glow-gold text-primary-foreground"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* New Sale Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 glass-card rounded-2xl p-4 space-y-4 animate-fade-in">
          <h2 className="text-sm font-semibold text-foreground">Nova Venda</h2>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Cliente</label>
            <input
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="w-full rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Nome do cliente"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Litros</label>
              <input
                type="number"
                step="0.1"
                value={liters}
                onChange={(e) => setLiters(e.target.value)}
                className="w-full rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="0.00"
                required
              />
              {selectedReservoir && (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Disponível: {selectedReservoir.currentLiters.toFixed(1)}L
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Combustível</label>
              <select
                value={selectedReservoirId}
                onChange={(e) => setSelectedReservoirId(Number(e.target.value))}
                className="w-full rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50"
              >
                {reservoirs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} (R$ {r.salePrice.toFixed(2)}/L)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock Warning */}
          {selectedReservoir && parseFloat(liters) > selectedReservoir.currentLiters && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-xs text-destructive">
                Estoque insuficiente! Máximo: {selectedReservoir.currentLiters.toFixed(1)}L
              </p>
            </div>
          )}

          {/* Preview total */}
          {previewTotal > 0 && parseFloat(liters) <= (selectedReservoir?.currentLiters ?? 0) && (
            <div className="rounded-xl bg-primary/10 p-3 text-center">
              <p className="text-xs text-muted-foreground">Total da venda</p>
              <p className="text-lg font-bold text-gradient-gold">R$ {previewTotal.toFixed(2)}</p>
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs text-muted-foreground">Pagamento</label>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setPayment(m)}
                  className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                    payment === m
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Check className="h-4 w-4" /> Registrar Venda
          </button>
        </form>
      )}

      {/* Recent Sales */}
      <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Vendas Recentes</h2>
        <div className="space-y-3">
          {sales.map((sale) => (
            <div key={sale.id} className="glass-card rounded-2xl p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{sale.client}</p>
                <p className="text-xs text-muted-foreground">{sale.liters}L {sale.fuelType} · {sale.payment}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-foreground">R$ {sale.total.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{format(sale.date, "HH:mm")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sales;
