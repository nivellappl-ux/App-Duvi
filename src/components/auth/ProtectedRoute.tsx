import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { canAccessModule, defaultRouteByRole, type ModuleKey } from "@/lib/rbac";

const moduleByPath: Array<{ prefix: string; module: ModuleKey }> = [
  { prefix: "/dashboard", module: "dashboard" },
  { prefix: "/financeiro", module: "financeiro" },
  { prefix: "/diario-caixa", module: "diario_caixa" },
  { prefix: "/conta-bancaria", module: "conta_bancaria" },
  { prefix: "/plafond", module: "plafond" },
  { prefix: "/documentos", module: "documentos" },
  { prefix: "/fiscalidade", module: "fiscalidade" },
  { prefix: "/rh", module: "rh" },
  { prefix: "/analise", module: "analise" },
  { prefix: "/utilizadores", module: "utilizadores" },
  { prefix: "/auditoria", module: "auditoria" },
  { prefix: "/configuracoes", module: "configuracoes" },
];

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">A validar sessão...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const routeModule = moduleByPath.find(({ prefix }) => location.pathname.startsWith(prefix))?.module;
  if (routeModule && !canAccessModule(user.role, routeModule)) {
    return <Navigate to={defaultRouteByRole(user.role)} replace />;
  }

  if (user.suspended) {
    return <div className="flex min-h-screen items-center justify-center text-destructive">Conta suspensa. Contacta o administrador.</div>;
  }

  return <>{children}</>;
};