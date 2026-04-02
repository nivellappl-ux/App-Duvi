import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  FileText,
  Wallet,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ChevronRight,
  BookOpen,
  Shield,
  Building2,
  Layers,
  Activity,
} from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard as KPICard } from "@/components/common/KpiCard";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";

// --- Data ---
const chartData = [
  { month: "Out", receitas: 42000000, despesas: 31000000, lucro: 11000000 },
  { month: "Nov", receitas: 48000000, despesas: 35000000, lucro: 13000000 },
  { month: "Dez", receitas: 55000000, despesas: 38000000, lucro: 17000000 },
  { month: "Jan", receitas: 45000000, despesas: 32000000, lucro: 13000000 },
  { month: "Fev", receitas: 52000000, despesas: 36000000, lucro: 16000000 },
  { month: "Mar", receitas: 67000000, despesas: 44000000, lucro: 23000000 },
];

const recentActivity = [
  { id: "FT 2025/245", type: "fatura", client: "Sonangol E.P.", amount: 12500000, date: "31/03/2025", status: "Paga" },
  { id: "FT 2025/244", type: "fatura", client: "Unitel S.A.", amount: 8750000, date: "30/03/2025", status: "Pendente" },
  { id: "DES-2025/0043", type: "despesa", client: "Salários Março 2025", amount: 11900000, date: "31/03/2025", status: "Pago" },
  { id: "FT 2025/243", type: "fatura", client: "BAI", amount: 15200000, date: "29/03/2025", status: "Paga" },
  { id: "FT 2025/242", type: "fatura", client: "Angola Telecom", amount: 6300000, date: "28/03/2025", status: "Vencida" },
];

const alerts = [
  { id: "a1", level: "danger", icon: AlertTriangle, title: "Faturas Vencidas", desc: "FT 2025/242 — Angola Telecom (6.3M AOA)", action: "Ver Faturação", path: "/faturacao" },
  { id: "a2", level: "warning", icon: Clock, title: "INSS vence em 10/04", desc: "Contribuição Março — 1.904M AOA por liquidar", action: "Ver Fiscalidade", path: "/fiscalidade" },
  { id: "a3", level: "warning", icon: Clock, title: "IVA vence em 15/04", desc: "Declaração Março — 6.58M AOA por entregar", action: "Ver Fiscalidade", path: "/fiscalidade" },
  { id: "a4", level: "info", icon: AlertTriangle, title: "Plafond Crítico", desc: "Tecnologia (95%) e Operações (92%) quase esgotados", action: "Ver Plafond", path: "/plafond" },
];

const modules = [
  { icon: TrendingUp, label: "Financeiro", path: "/financeiro", desc: "Receitas & Despesas", color: "#2563EB" },
  { icon: BookOpen, label: "Diário de Caixa", path: "/diario-caixa", desc: "Movimentos do dia", color: "#10B981" },
  { icon: FileText, label: "Faturação", path: "/faturacao", desc: "Faturas AGT-compliant", color: "#3B82F6" },
  { icon: Users, label: "Recursos Humanos", path: "/rh", desc: "Salários & INSS/IRT", color: "#8B5CF6" },
  { icon: Shield, label: "Fiscalidade", path: "/fiscalidade", desc: "IVA · INSS · IRT", color: "#EF4444" },
  { icon: Building2, label: "Conta Bancária", path: "/conta-bancaria", desc: "BAI · BFA · BIC", color: "#F59E0B" },
  { icon: Layers, label: "Plafond", path: "/plafond", desc: "Orçamento departamentos", color: "#EC4899" },
  { icon: Wallet, label: "Tesouraria", path: "/tesouraria", desc: "Fluxo de caixa", color: "#06B6D4" },
];

const alertStyles: Record<string, string> = {
  danger: "bg-destructive/5 border-destructive/20 text-destructive",
  warning: "bg-warning/5 border-warning/20 text-warning",
  info: "bg-primary/5 border-primary/20 text-primary",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 0 }).format(v);

const getStatusTone = (status: string): "success" | "warning" | "info" | "danger" => {
  switch (status) {
    case "Paga":
    case "Pago":
      return "success";
    case "Pendente":
      return "warning";
    case "Vencida":
      return "danger";
    default:
      return "info";
  }
};

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Dashboard"
        description="Bem-vindo ao sistema de gestão Duvion ERP. Visão geral consolidada."
        action={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-success/30 bg-success/5 text-success font-bold text-[11px]">
            <Activity size={13} className="animate-pulse" /> SISTEMA OPERACIONAL
          </div>
        }
      />

      {/* Main KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Receitas (Mar)" value="67.0M AOA" icon={ArrowUpRight} change="+12.5%" trend="up" />
        <KPICard label="Despesas (Mar)" value="44.0M AOA" icon={ArrowDownRight} change="+4.1%" trend="down" />
        <KPICard label="Resultado Líquido" value="23.0M AOA" icon={DollarSign} change="+22.3%" trend="up" accent />
        <KPICard label="Saldo em Caixa" value="39.1M AOA" icon={Wallet} change="+5.1%" trend="up" hint="≈ 46k USD" />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Faturas Emitidas", value: "245", icon: FileText, color: "#2563EB" },
          { label: "Faturas Pendentes", value: "12", icon: Clock, color: "#F59E0B" },
          { label: "Funcionários", value: "127", icon: Users, color: "#8B5CF6" },
          { label: "Obrigações Fiscais", value: "3", icon: Shield, color: "#EF4444" },
        ].map((item) => (
          <div key={item.label} className="p-4 rounded-lg flex items-center gap-3 border bg-card hover:bg-card-hover transition-colors cursor-pointer group">
            <div className="p-2.5 rounded-md shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: `${item.color}15` }}>
              <item.icon size={16} style={{ color: item.color }} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{item.value}</p>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard
            title="Performance Financeira — Semestral"
            subtitle="Análise comparativa de Receitas, Despesas e Margem de Lucro."
            actions={
              <button
                onClick={() => navigate("/financeiro")}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                VER DETALHE <ChevronRight size={12} />
              </button>
            }
          >
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}
                    formatter={(v: any) => [`${(v / 1000000).toFixed(1)}M AOA`]}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px", fontSize: "11px", fontWeight: "bold" }}
                    formatter={(v) => v.toUpperCase()}
                  />
                  <Bar dataKey="receitas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Receitas" />
                  <Bar dataKey="despesas" fill="#EF4444" opacity={0.6} radius={[4, 4, 0, 0]} name="Despesas" />
                  <Line type="monotone" dataKey="lucro" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: "#10B981" }} name="Lucro" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Alertas Activos" noPadding>
            <div className="p-4 space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => navigate(alert.path)}
                  className={`p-3 rounded-lg cursor-pointer border transition-all hover:scale-[1.02] ${alertStyles[alert.level]}`}
                >
                  <div className="flex items-start gap-2">
                    <alert.icon size={14} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[12px] font-bold leading-tight">{alert.title}</p>
                      <p className="text-[11px] opacity-80 mt-1 leading-relaxed">{alert.desc}</p>
                      <button className="text-[10px] font-bold mt-2 uppercase tracking-widest hover:underline">
                        {alert.action} →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Activity + Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard
            title="Actividade Recente"
            noPadding
            actions={
              <button className="text-[11px] font-bold text-primary hover:underline">VER TODAS</button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/5">
                    <th className="text-left p-4 text-[10px] font-bold text-primary uppercase">Referência</th>
                    <th className="text-left p-4 text-[10px] font-bold text-primary uppercase">Cliente/Descrição</th>
                    <th className="text-right p-4 text-[10px] font-bold text-primary uppercase">Valor</th>
                    <th className="text-center p-4 text-[10px] font-bold text-primary uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {recentActivity.map((tx, i) => (
                    <tr key={tx.id} className={`group hover:bg-muted/30 transition-colors ${i % 2 === 0 ? 'bg-transparent' : 'bg-muted/5'}`}>
                      <td className="p-4 text-[11px] font-bold text-primary">{tx.id}</td>
                      <td className="p-4">
                        <p className="text-[12px] font-bold">{tx.client}</p>
                        <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                      </td>
                      <td className="p-4 text-right">
                        <p className={`text-[12px] font-bold ${tx.type === 'despesa' ? 'text-destructive' : 'text-foreground'}`}>
                          {tx.type === 'despesa' ? '-' : '+'}{(tx.amount / 1000000).toFixed(1)}M
                        </p>
                        <p className="text-[9px] font-bold text-muted-foreground">AOA</p>
                      </td>
                      <td className="p-4 text-center">
                        <StatusBadge label={tx.status} tone={getStatusTone(tx.status)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Acesso Rápido" noPadding>
          <div className="p-3 grid grid-cols-2 gap-2">
            {modules.map((mod) => (
              <button
                key={mod.path}
                onClick={() => navigate(mod.path)}
                className="flex flex-col items-start p-3 rounded-lg border bg-muted/20 hover:bg-card-hover hover:border-primary/50 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-md flex items-center justify-center mb-2 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${mod.color}15` }}>
                  <mod.icon size={15} style={{ color: mod.color }} />
                </div>
                <p className="text-[11px] font-bold text-foreground">{mod.label}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{mod.desc}</p>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Footer Stats */}
      <div className="p-4 rounded-lg grid grid-cols-2 lg:grid-cols-4 gap-4 border bg-card/50">
        {[
          { label: "IVA Pendente (Mar)", value: "6.58M AOA", color: "var(--primary)" },
          { label: "Folha Salarial (Mar)", value: "11.9M AOA", color: "#8B5CF6" },
          { label: "Saldo Bancário Total", value: "107.2M AOA", color: "#10B981" },
          { label: "Taxa BNA (USD/AOA)", value: "1 USD = 850 AOA", color: "#06B6D4" },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
            <p className="text-[13px] font-bold mt-0.5" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
