import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";

export interface Reservoir {
  id: number;
  name: string;
  capacity: number;
  currentLiters: number;
  purchasedLiters: number;
  purchasePrice: number;
  salePrice: number;
  soldLiters: number;
  createdAt: Date;
}

export interface Sale {
  id: number;
  client: string;
  liters: number;
  fuelType: string;
  reservoirId: number;
  payment: string;
  pricePerLiter: number;
  total: number;
  date: Date;
}

export interface Transaction {
  id: number;
  desc: string;
  value: number;
  type: "entrada" | "saida";
  date: Date;
}

interface AppDataContextType {
  reservoirs: Reservoir[];
  sales: Sale[];
  transactions: Transaction[];
  addReservoir: (r: Omit<Reservoir, "id" | "soldLiters" | "createdAt">) => Promise<void>;
  addSale: (s: { client: string; liters: number; reservoirId: number; payment: string }) => Promise<string | null>;
}

const AppDataContext = createContext<AppDataContextType | null>(null);

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be inside AppDataProvider");
  return ctx;
};

const buildTransactionsFromData = (reservoirs: Reservoir[], sales: Sale[]): Transaction[] => {
  const txs: Transaction[] = [];
  let id = 1;

  // Purchases as expenses
  reservoirs.forEach((r) => {
    txs.push({
      id: id++,
      desc: `Compra ${r.name} - ${r.purchasedLiters}L`,
      value: -(r.purchasedLiters * r.purchasePrice),
      type: "saida",
      date: r.createdAt,
    });
  });

  // Sales as income
  sales.forEach((s) => {
    txs.push({
      id: id++,
      desc: `Venda ${s.fuelType} - ${s.client}`,
      value: s.total,
      type: "entrada",
      date: s.date,
    });
  });

  return txs.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [reservoirs, setReservoirs] = useState<Reservoir[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resRes = await fetch('/api/reservoirs');
        const dataRes = await resRes.json();
        setReservoirs(dataRes.map((r: any) => ({ ...r, createdAt: new Date(r.createdAt) })));

        const resSales = await fetch('/api/sales');
        const dataSales = await resSales.json();
        setSales(dataSales.map((s: any) => ({ ...s, date: new Date(s.date) })));
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const transactions = buildTransactionsFromData(reservoirs, sales);

  const addReservoir = useCallback(async (r: Omit<Reservoir, "id" | "soldLiters" | "createdAt">) => {
    try {
      const res = await fetch('/api/reservoirs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(r)
      });
      const data = await res.json();
      setReservoirs((prev) => [
        ...prev,
        { ...data, createdAt: new Date(data.createdAt) },
      ]);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const addSale = useCallback(async (s: { client: string; liters: number; reservoirId: number; payment: string }): Promise<string | null> => {
    const reservoir = reservoirs.find((r) => r.id === s.reservoirId);
    if (!reservoir) return "Reservatório não encontrado.";
    if (s.liters > reservoir.currentLiters) {
      return `Estoque insuficiente! Disponível: ${reservoir.currentLiters.toFixed(1)}L de ${reservoir.name}.`;
    }
    if (s.liters <= 0) return "Quantidade inválida.";

    const total = s.liters * reservoir.salePrice;
    
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...s, fuelType: reservoir.name, pricePerLiter: reservoir.salePrice, total })
      });
      const data = await res.json();
      
      if (!res.ok) {
        return data.error || "Erro no servidor.";
      }

      const newSale = { ...data, date: new Date(data.date) };

      setSales((prev) => [newSale, ...prev]);
      setReservoirs((prev) =>
        prev.map((r) =>
          r.id === s.reservoirId
            ? { ...r, currentLiters: r.currentLiters - s.liters, soldLiters: r.soldLiters + s.liters }
            : r
        )
      );
      return null;
    } catch (err) {
      console.error(err);
      return "Erro ao salvar venda.";
    }
  }, [reservoirs]);

  return (
    <AppDataContext.Provider value={{ reservoirs, sales, transactions, addReservoir, addSale }}>
      {children}
    </AppDataContext.Provider>
  );
};
