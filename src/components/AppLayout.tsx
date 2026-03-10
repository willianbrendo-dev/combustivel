import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, ShoppingCart, DollarSign, Database } from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Início", icon: Home },
  { path: "/vendas", label: "Vendas", icon: ShoppingCart },
  { path: "/financeiro", label: "Financeiro", icon: DollarSign },
  { path: "/estoque", label: "Estoque", icon: Database },
];

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 overflow-y-auto pb-28">
        <Outlet />
      </div>

      {/* Bottom Island Navigation */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center safe-bottom p-4 z-50">
        <nav className="glass-strong rounded-2xl px-2 py-2 flex items-center gap-1 w-full max-w-sm glow-blue">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground active:bg-muted/30"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AppLayout;
