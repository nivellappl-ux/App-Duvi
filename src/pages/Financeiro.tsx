import { useState, useMemo } from "react";
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
import { KPICard } from "@/components/shared/KPICard";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";

// --- Data ---
const chartData = [
  { month: "Out", receitas: 42000000, despesas: 31000000 },
  { month: "Nov", receitas: 48000000, despesas: 35000000 },
  { month: "Dez", receitas: 55000000, despesas: 38000000 },
  { month: "Jan", receitas: 45000000, despesas: 32000000 },
  { month: "Fev", receitas: 52000000, despesas: 36000000 },
  { month: "Mar", receitas: 67000000, despesas: 44000000 },
];

const receitas = [
  { id: "REC-2025/0087", descricao: "Serviços de Consultoria — Sonangol", data: "28/03/2025", valor: 12500000, categoria: "Serviços", estado: "Recebido" },
  { id: "REC-2025/0086", descricao: "Venda de Equipamentos — Unitel", data: "25/03/2025", valor: 8750000, categoria: "Vendas", estado: "Pendente" },
  { id: "REC-2025/0085", descricao: "Contrato de Manutenção — BAI", data: "22/03/2025", valor: 15200000, categoria: "Serviços", estado: "Recebido" },
  { id: "REC-2025/0084", descricao: "Consultoria Técnica — TAAG", data: "18/03/2025", valor: 9800000, categoria: "Serviços", estado: "Recebido" },
  { id: "REC-2025/0083", descricao: "Fornecimento de Software — Angola Telecom", data: "15/03/2025", valor: 6300000, categoria: "Licenças", estado: "Recebido" },
];

const despesas = [
  { id: "DES-2025/0043", descricao: "Salários — Março 2025", data: "31/03/2025", valor: 11900000, categoria: "RH", estado: "Pago" },
  { id: "DES-2025/0042", descricao: "INSS Empregador — Março", data: "30/03/2025", valor: 952000, categoria: "Impostos", estado: "Pago" },
  { id: "DES-2025/0041", descricao: "Aluguel Escritório — Abril", data: "01/04/2025", valor: 2500000, categoria: "Infraestrutura", estado: "Pendente" },
  { id: "DES-2025/0040", descricao: "Fornecedor — Electro Services", data: "02/04/2025", valor: 8500000, categoria: "Fornecedores", estado: "Pendente" },
  { id: "DES-2025/0039", descricao: "Material de Escritório", data: "20/03/2025", valor: 450000, categoria: "Administrativo", estado: "Pago" },
];

const categoriaColors: Record<string, string> = {
  Serviços: "var(--primary)",
  Vendas: "#10B981",
  Licenças: "#3B82F6",
  RH: "#8B5CF6",
  Impostos: "#EF4444",
  Infraestrutura: "#F59E0B",
  Fornecedores: "#EC4899",
  Administrativo: "#6B7280",
};

// --- Helpers ---
const fmt = (v: number) =>
  new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 0 }).format(v);

export default function Financeiro() {
  const [activeTab, setActiveTab] = useState<"receitas" | "despesas">("receitas");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"data" | "valor">("data");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const totalReceitas = receitas.reduce((s, r) => s + r.valor, 0);
  const totalDespesas = despesas.reduce((s, d) => s + d.valor, 0);
  const lucro = totalReceitas - totalDespesas;
  const margem = ((lucro / totalReceitas) * 100).toFixed(1);

  const data = activeTab === "receitas" ? receitas : despesas;

  const filteredData = useMemo(() => {
    return data
      .filter((r) =>
        r.descricao.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.categoria.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a: any, b: any) => {
        if (sortField === "valor") return sortDir === "asc" ? a.valor - b.valor : b.valor - a.valor;
        return sortDir === "asc"
          ? a.data.localeCompare(b.data)
          : b.data.localeCompare(a.data);
      });
  }, [data, search, sortField, sortDir]);

  const toggleSort = (field: "data" | "valor") => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        icon={TrendingUp}
        title="Financeiro"
        subtitle="Controlo de receitas e despesas — Visão Consolidada"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white font-bold text-[13px] shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
            <Plus size={16} /> Novo Lançamento
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Receitas (Mar)" value={`${(totalReceitas / 1000000).toFixed(1)}M AOA`} icon={ArrowUpRight} change="+12.5%" trend="up" />
        <KPICard title="Despesas (Mar)" value={`${(totalDespesas / 1000000).toFixed(1)}M AOA`} icon={ArrowDownRight} change="+4.1%" trend="down" />
        <KPICard title="Resultado Líquido" value={`${(lucro / 1000000).toFixed(1)}M AOA`} icon={DollarSign} change="+22.3%" trend="up" accent />
        <KPICard title="Margem Operacional" value={`${margem}%`} icon={TrendingUp} change="+3.2pp" trend="up" />
      </div>

      {/* Chart */}
      <SectionCard
        title="Fluxo de Caixa Mensal"
        subtitle="Histórico de receitas vs despesas consolidadas"
        actions={
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-xs font-bold text-muted-foreground hover:bg-muted/30">
            <Download size={13} /> Exportar Relatório
          </button>
        }
      >
        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="var(--text-muted)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
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
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}
                itemStyle={{ padding: "2px 0" }}
                formatter={(value: number, name: string) => [`${fmt(value)} AOA`, name === "receitas" ? "Receitas" : "Despesas"]}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: "20px", fontSize: "11px", fontWeight: "bold" }}
                formatter={(v) => v.toUpperCase()}
              />
              <Area
                type="monotone"
                dataKey="receitas"
                stroke="var(--primary)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorReceitas)"
                name="receitas"
                animationDuration={1500}
              />
              <Area
                type="monotone"
                dataKey="despesas"
                stroke="#EF4444"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorDespesas)"
                name="despesas"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      {/* Transactions Table */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex border-b border-border w-full md:w-auto">
            {(["receitas", "despesas"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <span className="flex items-center gap-2">
                  {tab === "receitas" ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                  {tab}
                </span>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar lançamentos..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted/30">
              <Filter size={16} />
            </button>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-primary bg-muted/10">
                  <th className="text-left py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-wider">Referência</th>
                  <th className="text-left py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-wider">Descrição</th>
                  <th className="text-left py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-wider">Categoria</th>
                  <th className="text-left py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-wider cursor-pointer hover:bg-primary/5" onClick={() => toggleSort("data")}>
                    Data {sortField === "data" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th className="text-right py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-wider cursor-pointer hover:bg-primary/5" onClick={() => toggleSort("valor")}>
                    Valor {sortField === "valor" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th className="text-center py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredData.map((row, i) => (
                  <tr key={row.id} className={`group hover:bg-primary/5 transition-colors ${i % 2 === 0 ? 'bg-transparent' : 'bg-muted/5'}`}>
                    <td className="py-4 px-4 text-[12px] font-bold text-primary">{row.id}</td>
                    <td className="py-4 px-4 text-[13px] font-medium text-foreground">{row.descricao}</td>
                    <td className="py-4 px-4">
                      <span
                        className="px-2.5 py-1 rounded text-[10px] font-bold"
                        style={{
                          backgroundColor: `${categoriaColors[row.categoria] || "#6B7280"}15`,
                          color: categoriaColors[row.categoria] || "#6B7280",
                        }}
                      >
                        {row.categoria.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[12px] text-muted-foreground font-medium">{row.data}</td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-[13px] font-bold text-foreground">{fmt(row.valor)}</span>
                      <span className="text-[10px] text-muted-foreground ml-1 font-bold">AOA</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <StatusBadge status={row.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/10 border-t border-border">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase">
                    Total {activeTab}
                  </td>
                  <td className="px-4 py-3 text-right text-[14px] font-bold text-primary">
                    {fmt(filteredData.reduce((s, r) => s + r.valor, 0))} AOA
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}