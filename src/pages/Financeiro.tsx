import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Filter,
  Search,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PermissionGate } from "@/components/auth/PermissionGate";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA", minimumFractionDigits: 0 }).format(v);

const formatCurrency = fmt;

export default function Financeiro() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Entrada" | "Saída">("Entrada");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [transRes, bankRes] = await Promise.all([
        supabase.from("transactions").select("*").order("transaction_date", { ascending: false }),
        supabase.from("bank_accounts").select("*")
      ]);

      if (transRes.error) throw transRes.error;
      if (bankRes.error) throw bankRes.error;

      setTransactions(transRes.data || []);
      setBankAccounts(bankRes.data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar dados financeiros: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalReceitas = transactions.filter(t => t.type === "Entrada").reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const totalDespesas = transactions.filter(t => t.type === "Saída").reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const saldo = totalReceitas - totalDespesas;
    return { totalReceitas, totalDespesas, saldo };
  }, [transactions]);

  const chartData = useMemo(() => {
    // Create a simplified monthly view (last 6 months)
    // This is a placeholder for actual aggregation logic
    return [
      { month: "Jan", receitas: stats.totalReceitas * 0.7, despesas: stats.totalDespesas * 0.8 },
      { month: "Fev", receitas: stats.totalReceitas * 0.8, despesas: stats.totalDespesas * 0.9 },
      { month: "Mar", receitas: stats.totalReceitas, despesas: stats.totalDespesas },
    ];
  }, [stats]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchType = t.type === activeTab;
      const matchSearch = t.description?.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [transactions, activeTab, search]);

  const columns = [
    {
      key: "transaction_date",
      label: "Data",
      render: (val: string) => new Date(val).toLocaleDateString()
    },
    {
      key: "description",
      label: "Descrição",
      render: (val: string) => <span className="font-medium text-foreground">{val}</span>
    },
    {
      key: "category",
      label: "Categoria",
      render: (val: string) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground uppercase">
          {val || 'Diversos'}
        </span>
      )
    },
    {
      key: "amount",
      label: "Valor",
      render: (val: number, row: any) => (
        <span className={`font-bold ${row.type === 'Entrada' ? 'text-success' : 'text-destructive'}`}>
          {row.type === 'Entrada' ? '+' : '-'}{fmt(val)}
        </span>
      )
    },
    {
      key: "status",
      label: "Estado",
      render: (val: any) => (
        <StatusBadge
          label={val || 'Concluído'}
          tone={val === "Conciliado" ? "success" : "neutral"}
        />
      )
    }
  ];

  return (
    <div className="p-6 space-y-6 pb-20">
      <PageHeader
        title="Tesouraria & Finanças"
        description="Controlo de caixa e movimentação bancária em tempo real"
        action={
          <PermissionGate permission="finance.manage">
            <Button className="bg-primary text-white shadow-lg shadow-primary/20">
              <Plus size={16} className="mr-2" /> Novo Lançamento
            </Button>
          </PermissionGate>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card shadow-sm border-l-4 border-l-success">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Receitas Acumuladas</p>
            <h3 className="text-2xl font-bold text-success">{formatCurrency(stats.totalReceitas)}</h3>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Despesas Realizadas</p>
            <h3 className="text-2xl font-bold text-destructive">{formatCurrency(stats.totalDespesas)}</h3>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Saldo em Caixa</p>
            <h3 className="text-2xl font-bold text-primary">{formatCurrency(stats.saldo)}</h3>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Contas Bancárias</p>
            <h3 className="text-2xl font-bold">{bankAccounts.length}</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 border-b p-4">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <DollarSign size={14} /> Fluxo de Caixa (Previsão 90 dias)
          </CardTitle>
        </CardHeader>
        <div className="h-72 w-full p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip />
              <Area type="monotone" dataKey="receitas" stroke="var(--primary)" fill="url(#colorRec)" strokeWidth={2} />
              <Area type="monotone" dataKey="despesas" stroke="#EF4444" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-2">
            {(["Entrada", "Saída"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg border ${activeTab === tab ? "bg-primary text-white border-primary shadow-lg shadow-primary/10" : "bg-card text-muted-foreground border-border hover:border-primary/30"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtre por descrição..."
              className="pl-9 h-9 text-xs bg-background/50"
            />
          </div>
        </div>

        <Card className="border-border shadow-md overflow-hidden">
          <CardContent className="p-0">
            <DataTable
              columns={columns as any}
              rows={filtered}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}