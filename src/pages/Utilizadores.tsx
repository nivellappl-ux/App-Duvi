import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, UserCog } from "lucide-react";
import { motion } from "framer-motion";

const mockUsers = [
  { nome: "João Silva", email: "joao.silva@empresa.ao", perfil: "Super Admin", departamento: "Administração", estado: "Ativo" },
  { nome: "Maria Costa", email: "maria.costa@empresa.ao", perfil: "Gestor", departamento: "Comercial", estado: "Ativo" },
  { nome: "Pedro Santos", email: "pedro.santos@empresa.ao", perfil: "Financeiro", departamento: "Financeiro", estado: "Ativo" },
  { nome: "Ana Lima", email: "ana.lima@empresa.ao", perfil: "Visualizador", departamento: "Geral", estado: "Inativo" },
];

const Utilizadores = () => {
  const columns = [
    { key: "nome", label: "Nome do Colaborador" },
    { key: "email", label: "Email Corporativo" },
    { key: "perfil", label: "Perfil de Acesso" },
    { key: "departamento", label: "Departamento" },
    {
      key: "estado",
      label: "Estado",
      render: (val: any) => (
        <StatusBadge label={val} tone={val === "Ativo" ? "success" : "neutral"} />
      )
    },
    {
      key: "ações",
      label: "",
      render: () => (
        <Button variant="ghost" size="sm" className="text-muted-foreground w-8 h-8 p-0">
          <UserCog className="h-4 w-4" />
        </Button>
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Gestão de Utilizadores"
          description="Controlo de acessos, perfis e permissões da equipa."
        />
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Adicionar Utilizador
        </Button>
      </div>

      <Card className="border-border/70 bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle>Equipa Registada</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns as any} rows={mockUsers} />
        </CardContent>
      </Card>
    </motion.section>
  );
};

export default Utilizadores;