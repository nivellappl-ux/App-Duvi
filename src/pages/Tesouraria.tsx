import { useState, useMemo } from "react";
import { Wallet, TrendingUp, TrendingDown, AlertCircle, RefreshCw, Download, ArrowUpRight, ArrowDownRight, Globe } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { KPICard } from "@/components/shared/KPICard";
import { StatusBadge } from "@/components/shared/StatusBadge";

// --- Data ---
const cashFlowData = [
    { month: "Out", entradas: 45000000, saidas: 32000000 },
    { month: "Nov", entradas: 52000000, saidas: 38000000 },
    { month: "Dez", entradas: 55000000, saidas: 38000000 },
    { month: "Jan", entradas: 45000000, saidas: 32000000 },
    { month: "Fev", entradas: 52000000, saidas: 36000000 },
    { month: "Mar", entradas: 67000000, saidas: 44000000 },
];

const bankAccounts = [
    { banco: "BAI", numero: "AO06 0040 0000 1234 5678 90", saldo: 45800000, moeda: "AOA" as const, cor: "#2563EB" },
    { banco: "BFA", numero: "AO06 1234 5678 9012 3456 78", saldo: 32500000, moeda: "AOA" as const, cor: "#3B82F6" },
    { banco: "BIC", numero: "AO06 0001 0002 0003 0004 00", saldo: 28900000, moeda: "AOA" as const, cor: "#10B981" },
    { banco: "BAI", numero: "AO06 0040 0000 5432 1876 09", saldo: 125000, moeda: "USD" as const, cor: "#2563EB" },
];

const pendingPayments = [
    { id: "PP-001", descricao: "Fornecedor — Electro Services", valor: 8500000, moeda: "AOA", vencimento: "02/04/2025", urgencia: "Urgente" },
    { id: "PP-002", descricao: "Salários — Março 2025", valor: 12500000, moeda: "AOA", vencimento: "05/04/2025", urgencia: "Urgente" },
    { id: "PP-003", descricao: "INSS — Contribuição Março", valor: 1904000, moeda: "AOA", vencimento: "10/04/2025", urgencia: "Normal" },
    { id: "PP-004", descricao: "IVA — Declaração Março", valor: 6580000, moeda: "AOA", vencimento: "15/04/2025", urgencia: "Normal" },
    { id: "PP-005", descricao: "Aluguel — Escritório Abril", valor: 2500000, moeda: "AOA", vencimento: "15/04/2025", urgencia: "Baixa" },
];

const BNA_RATE = 850;
const MARKET_RATE = 865;

const fmt = (v: number) =>
    new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 0 }).format(v);

export default function Tesouraria() {
    const [lastUpdate] = useState("31/03/2025 às 16:30");

    const stats = useMemo(() => {
        const totalAOA = bankAccounts.filter((a) => a.moeda === "AOA").reduce((s, a) => s + a.saldo, 0);
        const totalUSD = bankAccounts.filter((a) => a.moeda === "USD").reduce((s, a) => s + a.saldo, 0);
        const totalEquiv = totalAOA + totalUSD * BNA_RATE;
        const totalPendente = pendingPayments.reduce((s, p) => s + p.valor, 0);
        return { totalAOA, totalUSD, totalEquiv, totalPendente };
    }, []);

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                icon={Wallet}
                title="Tesouraria"
                subtitle="Gestão integral de liquidez, câmbios e relações bancárias."
                actions={
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted/30" title={`Actualizado: ${lastUpdate}`}>
                            <RefreshCw size={16} />
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-xs font-bold text-muted-foreground hover:bg-muted/30">
                            <Download size={14} /> EXPORTAR
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Saldo Consolidado" value={`${(stats.totalEquiv / 1000000).toFixed(1)}M AOA`} icon={Wallet} change="+5.1%" trend="up" accent />
                <KPICard title="Disponível (AOA)" value={`${(stats.totalAOA / 1000000).toFixed(1)}M AOA`} icon={ArrowUpRight} change="3 Contas" trend="up" />
                <KPICard title="Disponível (USD)" value={`$${fmt(stats.totalUSD)}`} icon={Globe} subtitle={`≈ ${(stats.totalUSD * BNA_RATE / 1000000).toFixed(1)}M AOA`} />
                <KPICard title="Responsabilidades" value={`${(stats.totalPendente / 1000000).toFixed(1)}M AOA`} icon={AlertCircle} change="5 pendentes" trend="down" />
            </div>

            {/* Mercado Cambial */}
            <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary"><TrendingUp size={18} /></div>
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Mercado Cambial USD/AOA</h3>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Fonte: BNA · {lastUpdate}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 rounded-xl border border-border bg-muted/10 group hover:border-primary/50 transition-all">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase mb-2">Taxa Oficial (BNA)</p>
                        <div className="flex items-center justify-between">
                            <p className="text-4xl font-black text-primary">{BNA_RATE}</p>
                            <div className="flex flex-col items-end">
                                <TrendingUp size={20} className="text-success" />
                                <span className="text-[11px] font-bold text-success">+0.2%</span>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase">Kwanza por Dólar</p>
                    </div>

                    <div className="p-5 rounded-xl border border-border bg-muted/10 group hover:border-destructive/30 transition-all">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase mb-2">Taxa de Mercado</p>
                        <div className="flex items-center justify-between">
                            <p className="text-4xl font-black text-foreground">{MARKET_RATE}</p>
                            <div className="flex flex-col items-end">
                                <TrendingDown size={20} className="text-destructive" />
                                <span className="text-[11px] font-bold text-destructive">-0.1%</span>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase">Média de mercado paralelo</p>
                    </div>

                    <div className="p-5 rounded-xl border border-primary/20 bg-primary/5">
                        <p className="text-[11px] font-bold text-primary uppercase mb-3">Conversor Rápido (BNA)</p>
                        <div className="flex items-center gap-3">
                            <div className="text-right flex-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">USD</p>
                                <p className="text-xl font-bold text-foreground">1,000</p>
                            </div>
                            <ArrowRight size={16} className="text-primary animate-pulse" />
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">AOA</p>
                                <p className="text-xl font-bold text-primary">{fmt(1000 * BNA_RATE)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <SectionCard
                        title="Fluxo de Caixa Operacional"
                        subtitle="Análise semestral de tesouraria: Entradas vs Saídas de Capital."
                    >
                        <div className="h-72 w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cashFlowData} barGap={6}>
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
                                    <Bar dataKey="entradas" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Inflow" />
                                    <Bar dataKey="saidas" fill="#1C1C1C" stroke="var(--border)" radius={[4, 4, 0, 0]} name="Outflow" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SectionCard>
                </div>

                <div className="space-y-4">
                    <SectionCard title="Contas Correntes Bancárias" noPadding>
                        <div className="p-4 space-y-4">
                            {bankAccounts.map((account) => (
                                <div key={`${account.banco}-${account.moeda}`} className="p-4 rounded-xl border border-border bg-card-hover/50 hover:bg-card-hover transition-all group">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold text-white shadow-sm" style={{ backgroundColor: account.cor }}>
                                            {account.banco}
                                        </span>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{account.moeda}</span>
                                    </div>
                                    <p className="text-[10px] font-mono text-muted-foreground mb-3">{account.numero}</p>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-[18px] font-black text-foreground group-hover:text-primary transition-colors">
                                                {account.moeda === "USD" ? "$" : ""}{fmt(account.saldo)}
                                            </p>
                                            {account.moeda === "USD" && (
                                                <p className="text-[10px] font-bold text-muted-foreground">≈ {fmt(account.saldo * BNA_RATE)} AOA</p>
                                            )}
                                        </div>
                                        <ArrowUpRight size={18} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            </div>

            <SectionCard
                title="Obrigações de Liquidação"
                subtitle="Pagamentos aprovados e pendentes de execução financeira."
                noPadding
                actions={<button className="text-[11px] font-bold text-primary hover:underline uppercase tracking-widest">MAPA DE PAGAMENTOS →</button>}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-primary bg-muted/10 text-[10px] font-bold text-primary uppercase tracking-widest">
                                <th className="p-4">Referência</th>
                                <th className="p-4">Descrição do Pagamento</th>
                                <th className="p-4">Vencimento</th>
                                <th className="p-4 text-right">Valor Líquido (AOA)</th>
                                <th className="p-4 text-center">Prioridade</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {pendingPayments.map((p, i) => (
                                <tr key={p.id} className={`group hover:bg-primary/5 transition-colors ${i % 2 === 0 ? 'bg-transparent' : 'bg-muted/5'}`}>
                                    <td className="p-4 text-[12px] font-bold text-primary">{p.id}</td>
                                    <td className="p-4">
                                        <p className="text-[13px] font-bold text-foreground">{p.descricao}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{p.moeda} Base</p>
                                    </td>
                                    <td className="p-4 text-[12px] font-medium text-muted-foreground">{p.vencimento}</td>
                                    <td className="p-4 text-right text-[13px] font-bold text-foreground">{fmt(p.valor)}</td>
                                    <td className="p-4 text-center">
                                        <StatusBadge status={p.urgencia as any} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-muted/5 border-t-2 border-border">
                                <td colSpan={3} className="p-4 text-[11px] font-bold text-muted-foreground">TOTAL PROVISIONADO</td>
                                <td className="p-4 text-right text-[16px] font-black text-primary">{fmt(stats.totalPendente)} AOA</td>
                                <td />
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </SectionCard>
        </div>
    );
}

function ArrowRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
}
