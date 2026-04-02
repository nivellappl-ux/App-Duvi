import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, UserCog, ShieldCheck, UserX } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PermissionGate } from "@/components/auth/PermissionGate";

export default function Utilizadores() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles joined with auth.users (email) and user_roles
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          user_id,
          full_name,
          suspended,
          created_at,
          user_roles (
            role
          )
        `);

      if (error) throw error;

      // Map to flatten roles
      const formatted = data.map(u => ({
        ...u,
        perfil: (u.user_roles as any)?.[0]?.role || 'visualizador',
        estado: u.suspended ? "Suspenso" : "Ativo"
      }));

      setUsers(formatted);
    } catch (error: any) {
      toast.error("Erro ao carregar utilizadores: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { key: "full_name", label: "Nome do Colaborador" },
    {
      key: "perfil", label: "Perfil / Role", render: (val: string) => (
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-primary" />
          <span className="capitalize">{val}</span>
        </div>
      )
    },
    {
      key: "estado",
      label: "Estado",
      render: (val: any) => (
        <StatusBadge label={val} tone={val === "Ativo" ? "success" : "danger"} />
      )
    },
    { key: "created_at", label: "Data de Registo", render: (val: string) => new Date(val).toLocaleDateString() },
    {
      key: "ações",
      label: "",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <PermissionGate permission="user.edit">
            <Button variant="ghost" size="sm" className="text-muted-foreground w-8 h-8 p-0">
              <UserCog className="h-4 w-4" />
            </Button>
          </PermissionGate>
          {row.estado === "Ativo" && (
            <PermissionGate role="super_admin">
              <Button variant="ghost" size="sm" className="text-destructive w-8 h-8 p-0">
                <UserX className="h-4 w-4" />
              </Button>
            </PermissionGate>
          )}
        </div>
      )
    }
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      <PageHeader
        title="Gestão de Utilizadores"
        description="Controlo de acessos, perfis e permissões granulares da equipa enterprise."
        action={
          <PermissionGate permission="user.create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Novo Utilizador
            </Button>
          </PermissionGate>
        }
      />

      <Card className="border-border/70 bg-card/80 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-sm font-bold uppercase tracking-wider">Equipa Registada (Produção)</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <DataTable columns={columns as any} rows={users} isLoading={isLoading} />
        </CardContent>
      </Card>
    </motion.section>
  );
}