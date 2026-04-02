import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/rbac";

type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: AppRole | null;
  mustChangePassword: boolean;
  suspended: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const rolePriority: AppRole[] = ["super_admin", "gestor", "financeiro", "rh", "visualizador"];

const selectPrimaryRole = (roles: string[]): AppRole | null => {
  const typedRoles = roles.filter((role): role is AppRole => rolePriority.includes(role as AppRole));
  return rolePriority.find((role) => typedRoles.includes(role)) ?? null;
};

const fetchAuthUser = async (): Promise<AuthUser | null> => {
  const { data } = await supabase.auth.getUser();
  const authUser = data.user;
  if (!authUser?.id || !authUser.email) return null;

  const db = supabase as any;

  const [profileRes, rolesRes] = await Promise.all([
    db.from("profiles").select("full_name,must_change_password,suspended").eq("user_id", authUser.id).maybeSingle(),
    db.from("user_roles").select("role").eq("user_id", authUser.id),
  ]);

  const fullName = profileRes.data?.full_name ?? authUser.email.split("@")[0];
  const role = selectPrimaryRole((rolesRes.data ?? []).map((row: { role: string }) => row.role));

  return {
    id: authUser.id,
    email: authUser.email,
    fullName,
    role,
    mustChangePassword: Boolean(profileRes.data?.must_change_password),
    suspended: Boolean(profileRes.data?.suspended),
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const authUser = await fetchAuthUser();
    setUser(authUser);
  };

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (_event) => {
      const authUser = await fetchAuthUser();
      setUser(authUser);
      setLoading(false);
    });

    void supabase.auth.getSession().then(async ({ data: sessionData }) => {
      if (!sessionData.session) {
        setUser(null);
        setLoading(false);
        return;
      }

      const authUser = await fetchAuthUser();
      setUser(authUser);
      setLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: "Credenciais inválidas. Verifica o email e a palavra-passe." };
    }

    const auditPayload = {
      actor_user_id: (await supabase.auth.getUser()).data.user?.id,
      action: "login_success",
      module: "auth",
      metadata: { email },
    };
    await (supabase as any).from("audit_logs").insert(auditPayload);

    return {};
  };

  const logout = async () => {
    const currentUser = (await supabase.auth.getUser()).data.user;
    if (currentUser?.id) {
      await (supabase as any).from("audit_logs").insert({
        actor_user_id: currentUser.id,
        action: "logout",
        module: "auth",
      });
    }
    await supabase.auth.signOut();
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, logout, refresh }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
};