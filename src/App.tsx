import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppDataProvider } from "./contexts/AppDataContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Financial from "./pages/Financial";
import FinancialReport from "./pages/FinancialReport";
import Inventory from "./pages/Inventory";
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = localStorage.getItem("fuelapp_auth") === "true";
  return isAuth ? <>{children}</> : <Navigate to="/" replace />;
};

// FuelControl App
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-center" />
      <BrowserRouter>
        <AppDataProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/vendas" element={<Sales />} />
              <Route path="/financeiro" element={<Financial />} />
              <Route path="/financeiro/relatorio" element={<FinancialReport />} />
              <Route path="/estoque" element={<Inventory />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppDataProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
