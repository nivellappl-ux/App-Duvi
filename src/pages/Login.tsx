import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LogIn, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import duvionLogo from "@/assets/f74fa39df10f3fd556b81d464aeb8628aaf5cd57.png";
import blueBackground from "@/assets/fb210927da144d51d71f357549e1facc609f9841.png";

const loginSchema = z.object({
  email: z.string().email("Por favor, insira um email válido"),
  password: z.string().min(1, "A senha é obrigatória"),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      // Simular delay e chamar login real do contexto
      await new Promise(resolve => setTimeout(resolve, 800));
      await login(data.email, data.password);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative font-sans overflow-hidden"
      style={{
        backgroundColor: "#1E3A8A",
        backgroundImage: `url(${blueBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-blue-950/60" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
        {/* Logo - Outside the card */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center">
            <img
              src={duvionLogo}
              alt="Duvion Logo"
              className="w-24 h-24 md:w-28 md:h-28"
              style={{ filter: "drop-shadow(0 8px 32px rgba(37,99,235,0.4))" }}
            />
          </div>
        </div>

        {/* Login Card */}
        <div
          className="p-8 rounded-xl backdrop-blur-md"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
          }}
        >
          {/* Title inside card */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-1" style={{ color: "#2563EB" }}>
              Duvion
            </h1>
            <p className="text-sm font-medium" style={{ color: "#7B95BB" }}>
              Sistema de Gestão Empresarial
            </p>
          </div>

          <h2 className="text-xl font-bold mb-6" style={{ color: "#0C1626" }}>
            Iniciar Sessão
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-bold"
                style={{ color: "#0C1626" }}
              >
                Email
              </label>
              <input
                {...register("email")}
                id="email"
                type="email"
                className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none bg-white font-medium ${errors.email ? 'border-destructive' : 'border-slate-200'
                  }`}
                placeholder="seu@email.com"
                autoFocus
              />
              {errors.email && (
                <p className="text-destructive text-xs mt-1 font-semibold">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-bold"
                style={{ color: "#0C1626" }}
              >
                Senha
              </label>
              <input
                {...register("password")}
                id="password"
                type="password"
                className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none bg-white font-medium ${errors.password ? 'border-destructive' : 'border-slate-200'
                  }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-destructive text-xs mt-1 font-semibold">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("remember")}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-500 text-sm font-medium group-hover:text-slate-700 transition-colors">Lembrar-me</span>
              </label>
              <button
                type="button"
                className="text-blue-600 text-sm font-bold hover:text-blue-700 transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-lg flex items-center justify-center gap-2 transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-base mt-2"
              style={{
                backgroundColor: "#2563EB",
                boxShadow: "0 10px 20px -5px rgba(37,99,235,0.4)",
              }}
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  Entrar no Sistema
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo note */}
        <p className="text-center mt-6 text-slate-300/80 text-xs font-medium uppercase tracking-widest">
          Demo: qualquer email e senha funcionam
        </p>

        {/* Angola Flag Accent Bar */}
        <div className="mt-8 h-1.5 rounded-full flex overflow-hidden shadow-lg">
          <div className="flex-1" style={{ backgroundColor: "#CC0000" }} />
          <div className="flex-1" style={{ backgroundColor: "#000000" }} />
          <div className="flex-1" style={{ backgroundColor: "#FFD700" }} />
        </div>
      </div>
    </div>
  );
}