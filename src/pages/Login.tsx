import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Fuel, Eye, EyeOff, FileDown } from "lucide-react";
import { toast } from "sonner";
import { generateDocPDF } from "@/utils/generateDocPDF";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("fuelapp_auth", "true");
        toast.success("Bem-vindo(a) ao sistema!");
        navigate("/dashboard");
      } else {
        toast.error(data.error || "Credenciais inválidas!");
      }
    } catch (err) {
      toast.error("Erro ao conectar no servidor.");
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="mb-10 flex flex-col items-center animate-fade-in">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary glow-gold">
          <Fuel className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">FuelControl</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gestão de combustível</p>
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-muted/50 px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-all active:scale-[0.98] glow-gold"
        >
          Entrar
        </button>
      </form>

      <button
        onClick={() => { generateDocPDF(); toast.success("PDF gerado com sucesso!"); }}
        className="mt-4 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors animate-fade-in"
        style={{ animationDelay: "0.4s" }}
      >
        <FileDown className="h-4 w-4" />
        Baixar Documentação do Sistema
      </button>
    </div>
  );
};

export default Login;
