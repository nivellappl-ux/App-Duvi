import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, Clock, FileText, Calendar, Download, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KPICard } from "@/components/shared/KPICard";

const fmt = (v: number) =>
    new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 0 }).format(v);

interface TaxObligation {
    id: string;
    imposto: string;
    descricao: string;
    vencimento: string;
    valor: number;
    estado: "Entregue" | "Pendente" | "Atrasado" | "Em curso";
    referencia?: string;
    entidade: string;
}

const obligations: TaxObligation[] = [
    { id: "OBR-001", imposto: "IVA", descricao: "Declaração Mensal de IVA — Março 2025", vencimento: "15/04/2025", valor: 6580000, estado: "Pendente", entidade: "AGT" },
    { id: "OBR-002", imposto: "INSS", descricao: "Contribuição INSS — Março 2025", vencimento: "10/04/2025", valor: 1904000, estado: "Pendente", entidade: "INSS" },
    { id: "OBR-003", imposto: "IRT", descricao: "IRT Retido na Fonte — Março 2025", vencimento: "10/04/2025", valor: 1785000, estado: "Pendente", entidade: "AGT" },
    { id: "OBR-004", imposto: "IVA", descricao: "Declaração Mensal de IVA — Fevereiro 2025", vencimento: "15/03/2025", valor: 5670000, estado: "Entregue", referencia: "AGT-2025/03-1234", entidade: "AGT" },
    { id: "OBR-005", imposto: "INSS", descricao: "Contribuição INSS — Fevereiro 2025", vencimento: "10/03/2025", valor: 1904000, estado: "Entregue", referencia: "INSS-2025/03-0087", entidade: "INSS" },
    { id: "OBR-006", imposto: "IRT", descricao: "IRT Retido na Fonte — Fevereiro 2025", vencimento: "10/03/2025", valor: 1785000, estado: "Entregue", referencia: "AGT-2025/03-0342", entidade: "AGT" },
    { id: "OBR-007", imposto: "IR", descricao: "Imposto Industrial — Estimativa Q1 2025", vencimento: "30/04/2025", valor: 12000000, estado: "Em curso", entidade: "AGT" },
];

const ivaDeclarations = [
    { mes: "Janeiro 2025", base: 38500000, iva: 5390000, estado: "Entregue" },
    { mes: "Fevereiro 2025", base: 40500000, iva: 5670000, estado: "Entregue" },
    { mes: "Março 2025", base: 47000000, iva: 6580000, estado: "Pendente" },
];

const inssHistory = [
    { mes: "Janeiro 2025", empregado: 714000, empregador: 1904000, total: 2618000, estado: "Entregue" },
    { mes: "Fevereiro 2025", empregado: 714000, empregador: 1904000, total: 2618000, estado: "Entregue" },
    { mes: "Março 2025", empregado: 714000, empregador: 1904000, total: 2618000, estado: "Pendente" },
];

const irtScale = [
    { esc: "1º", min: 0, max: 34450, taxa: "0%", parcela: "—" },
    { esc: "2º", min: 34451, max: 35000, taxa: "10%", parcela: "3.445" },
    { esc: "3º", min: 35001, max: 40000, taxa: "13%", parcela: "4.496" },
    { esc: "4º", min: 40001, max: 45000, taxa: "16%", parcela: "5.696" },
    { esc: "5º", min: 45001, max: 50000, taxa: "18%", parcela: "6.596" },
    { esc: "6º", min: 50001, max: 70000, taxa: "19%", parcela: "7.096" },
    { esc: "7º", min: 70001, max: 0, taxa: "25%", parcela: "11.296" },
];

type Tab = "obrigacoes" | "iva" | "inss" | "irt";

export default function Fiscalidade() {
    const [activeTab, setActiveTab] = useState<Tab>("obrigacoes");

    const totalPendente = obligations.filter((o) => o.estado === "Pendente" || o.estado === "Atrasado").reduce((s, o) => s + o.valor, 0);
    const totalEntregue = obligations.filter((o) => o.estado === "Entregue").reduce((s, o) => s + o.valor, 0);

    const impostoColors: Record<string, string> = {
        IVA: "#3B82F6",
        INSS: "#8B5CF6",
        IRT: "var(--primary)",
        IR: "#10B981",
    };

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                icon={Shield}
                title="Fiscalidade & Compliance"
                subtitle="Gestão centralizada de impostos e obrigações declarativas AGT/INSS."
                actions={
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-xs font-bold text-muted-foreground hover:bg-muted/30">
                        <Download size={14} /> EXPORTAR MAPA FISCAL
                    </button>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total a Liquidar" value={`${(totalPendente / 1000000).toFixed(1)}M AOA`} icon={AlertTriangle} change="3 pendentes" trend="down" />
                <KPICard title="Entregue (YTD)" value={`${(totalEntregue / 1000000).toFixed(1)}M AOA`} icon={CheckCircle} change="+12.4%" trend="up" accent />
                <KPICard title="IVA (Março)" value={`${(6580000 / 1000000).toFixed(1)}M AOA`} icon={FileText} subtitle="A entregar até 15/04" />
                <KPICard title="INSS (Março)" value={`${(2618000 / 1000000).toFixed(1)}M AOA`} icon={Shield} subtitle="3% + 8% (Padrão)" />
            </div>

            {/* Alerta de Vencimento */}
            <div className="p-4 rounded-xl border-2 border-warning/30 bg-warning/5 flex items-start gap-4 animate-in slide-in-from-top-2 duration-500">
                <div className="p-2 rounded-lg bg-warning/10 text-warning">
                    <AlertTriangle size={20} />
                </div>
                <div>
                    <p className="text-[13px] font-bold text-warning uppercase tracking-widest mb-1">Prazos em Aproximação</p>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                        As guias de <span className="font-bold text-foreground">INSS e IRT</span> vencem em <span className="text-destructive font-bold">10/04/2025</span>.
                        A declaração de <span className="font-bold text-foreground">IVA</span> do mês de Março deve ser submetida até <span className="text-destructive font-bold">15/04/2025</span>.
                        Total provisionado para liquidação: <span className="text-primary font-bold">{fmt(totalPendente)} AOA</span>.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Navigation Tabs */}
                <div className="flex border-b border-border w-full overflow-x-auto">
                    {[
                        { id: "obrigacoes", label: "Obrigações Fiscais", icon: FileText },
                        { id: "iva", label: "Gestão de IVA", icon: FileText },
                        { id: "inss", label: "Segurança Social", icon: Shield },
                        { id: "irt", label: "Tabela IRT", icon: ArrowUpRight },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`px-6 py-4 text-[10px] font-bold uppercase tracking-[1.5px] transition-all relative flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <tab.icon size={12} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                            )}
                        </button>
                    ))}
                </div>

                <SectionCard title="" noPadding>
                    {activeTab === "obrigacoes" && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b-2 border-primary bg-muted/10">
                                        <th className="py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-widest">Imposto</th>
                                        <th className="py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-widest">Descrição</th>
                                        <th className="py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-widest">Entidade</th>
                                        <th className="py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-widest">Vencimento</th>
                                        <th className="py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-widest text-right">Valor Bruto</th>
                                        <th className="py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-widest text-center">Estado</th>
                                        <th className="py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-widest text-right">Ref. AGT</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {obligations.map((o, i) => (
                                        <tr key={o.id} className={`group hover:bg-primary/5 transition-colors ${i % 2 === 0 ? 'bg-transparent' : 'bg-muted/5'}`}>
                                            <td className="py-4 px-4">
                                                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold" style={{ backgroundColor: `${impostoColors[o.imposto] || "#6B7280"}15`, color: impostoColors[o.imposto] || "#6B7280" }}>
                                                    {o.imposto}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-[12px] font-bold text-foreground">
                                                {o.descricao}
                                            </td>
                                            <td className="py-4 px-4 text-[11px] font-bold text-muted-foreground">
                                                {o.entidade}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                                                    <Calendar size={12} /> {o.vencimento}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right text-[13px] font-bold text-foreground">
                                                {fmt(o.valor)} AOA
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <StatusBadge status={o.estado} />
                                            </td>
                                            <td className="py-4 px-4 text-right text-[11px] font-mono font-bold text-primary">
                                                {o.referencia || "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === "iva" && (
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-6 rounded-xl bg-card border border-border text-center group hover:border-primary/50 transition-all">
                                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Taxa Normal</p>
                                    <p className="text-3xl font-black text-primary group-hover:scale-110 transition-transform">14%</p>
                                    <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-wide">Base Jurídica: AGT (Regime Geral)</p>
                                </div>
                                <div className="p-6 rounded-xl bg-card border border-border text-center">
                                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Base Tributável (Março)</p>
                                    <p className="text-2xl font-black text-foreground">{fmt(47000000)}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-wide">Facturação Líquida Mensal</p>
                                </div>
                                <div className="p-6 rounded-xl bg-primary/10 border-2 border-primary/20 text-center">
                                    <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-2 text-shadow-sm">IVA a Liquidar</p>
                                    <p className="text-2xl font-black text-primary">{fmt(6580000)}</p>
                                    <p className="text-[10px] font-bold text-primary/70 mt-2 uppercase tracking-wide">AOA (Pendente)</p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-border overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-muted/10 border-b border-border">
                                            <th className="p-4 text-[10px] font-bold text-primary uppercase">Mês de Referência</th>
                                            <th className="p-4 text-[10px] font-bold text-primary uppercase">Base de Cálculo (AOA)</th>
                                            <th className="p-4 text-[10px] font-bold text-primary uppercase">IVA Apurado (14%)</th>
                                            <th className="p-4 text-[10px] font-bold text-primary uppercase text-center">Situação AGT</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {ivaDeclarations.map((d) => (
                                            <tr key={d.mes} className="hover:bg-muted/5 transition-colors">
                                                <td className="p-4 text-[12px] font-bold text-foreground">{d.mes}</td>
                                                <td className="p-4 text-[12px] font-medium text-muted-foreground">{fmt(d.base)}</td>
                                                <td className="p-4 text-[13px] font-bold text-primary">{fmt(d.iva)}</td>
                                                <td className="p-4 text-center"><StatusBadge status={d.estado} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "inss" && (
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-5 rounded-xl border border-border bg-card">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500"><Shield size={16} /></div>
                                        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Contribuição Trabalhador</h4>
                                    </div>
                                    <p className="text-3xl font-black text-foreground">3%</p>
                                    <div className="mt-4 pt-4 border-t border-border flex justify-between">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Retido na Fonte</span>
                                        <span className="text-[10px] font-bold text-success uppercase">Obrigatório</span>
                                    </div>
                                </div>
                                <div className="p-5 rounded-xl border border-border bg-card">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary"><Shield size={16} /></div>
                                        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Encargo Empresa</h4>
                                    </div>
                                    <p className="text-3xl font-black text-foreground">8%</p>
                                    <div className="mt-4 pt-4 border-t border-border flex justify-between">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Custo Operacional</span>
                                        <span className="text-[10px] font-bold text-success uppercase">Obrigatório</span>
                                    </div>
                                </div>
                                <div className="p-5 rounded-xl bg-primary/5 border border-primary/20">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-lg bg-primary text-white"><Clock size={16} /></div>
                                        <h4 className="text-[11px] font-bold text-primary uppercase tracking-widest">Datas de Entrega</h4>
                                    </div>
                                    <p className="text-xl font-bold text-foreground">Até dia 10</p>
                                    <p className="text-[11px] text-muted-foreground mt-1">Sempre referente ao mês anterior trabalhado.</p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-border overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-muted/10 border-b border-border">
                                            <th className="p-4 text-[10px] font-bold text-primary uppercase">Mês/Ano</th>
                                            <th className="p-4 text-[10px] font-bold text-primary uppercase">3% Trabalhadores</th>
                                            <th className="p-4 text-[10px] font-bold text-primary uppercase">8% Empresa</th>
                                            <th className="p-4 text-[10px] font-bold text-primary uppercase">Total Guia</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {inssHistory.map((d) => (
                                            <tr key={d.mes} className="hover:bg-muted/5 transition-colors">
                                                <td className="p-4 text-[12px] font-bold text-foreground">{d.mes}</td>
                                                <td className="p-4 text-[12px] font-medium text-muted-foreground text-right">{fmt(d.empregado)}</td>
                                                <td className="p-4 text-[12px] font-medium text-muted-foreground text-right">{fmt(d.empregador)}</td>
                                                <td className="p-4 text-[13px] font-bold text-primary text-right">{fmt(d.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "irt" && (
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-[13px] font-bold text-foreground">Tabela Progressiva IRT</h4>
                                    <p className="text-[11px] text-muted-foreground">Decreto Presidencial n.º 3/14 (Actualizada)</p>
                                </div>
                                <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                                    VER LEGISLAÇÃO COMPLETA
                                </button>
                            </div>

                            <div className="rounded-xl border-2 border-primary/20 overflow-hidden shadow-xl shadow-primary/5">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-primary/10 border-b border-primary/30">
                                            <th className="p-4 text-[10px] font-black text-primary uppercase tracking-tighter">Escalão</th>
                                            <th className="p-4 text-[10px] font-black text-primary uppercase tracking-tighter">Limiar Mínimo (AOA)</th>
                                            <th className="p-4 text-[10px] font-black text-primary uppercase tracking-tighter">Limiar Máximo (AOA)</th>
                                            <th className="p-4 text-[10px] font-black text-primary uppercase tracking-tighter text-center">Taxa IRT (%)</th>
                                            <th className="p-4 text-[10px] font-black text-primary uppercase tracking-tighter text-right">Parcela a Abater</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {irtScale.map((row, i) => (
                                            <tr key={row.esc} className={`transition-colors ${i % 2 === 1 ? 'bg-muted/5' : 'bg-transparent'} hover:bg-primary/5`}>
                                                <td className="p-4 text-[12px] font-black text-primary">{row.esc}</td>
                                                <td className="p-4 text-[12px] font-bold text-foreground">{row.min === 0 ? "ISENTO" : fmt(row.min)}</td>
                                                <td className="p-4 text-[12px] font-bold text-foreground">{row.max === 0 ? "ILIMITADO" : fmt(row.max)}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`text-[14px] font-black ${row.taxa === "0%" ? 'text-success' : 'text-destructive'}`}>{row.taxa}</span>
                                                </td>
                                                <td className="p-4 text-[12px] font-bold text-muted-foreground text-right">{row.parcela}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </SectionCard>
            </div>
        </div>
    );
}
