import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { defaultRouteByRole } from "@/lib/rbac";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">A carregar Duvion ERP...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={defaultRouteByRole(user.role)} replace />;
};

export default Index;
