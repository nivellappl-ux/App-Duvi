import { useState, useMemo } from "react";
import { Layers, AlertTriangle, Plus, TrendingUp, Edit2, Check, User, Target, History } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { KPICard } from "@/components/shared/KPICard";

// --- Data ---
interface Department {
    id: string;
    nome: string;
    responsavel: string;
    plafond: number;
    usado: number;
    cor: string;
}

const departments: Department[] = [
    { id: "D1", nome: "Comercial", responsavel: "Carlos Fernandes", plafond: 15000000, usado: 12800000, cor: "#2563EB" },
    { id: "D2", nome: "Tecnologia", responsavel: "Pedro Costa", plafond: 8000000, usado: 7600000, cor: "#EF4444" },
    { id: "D3", nome: "Marketing", responsavel: "Beatriz Lopes", plafond: 6000000, usado: 3200000, cor: "#10B981" },
    { id: "D4", nome: "RH", responsavel: "Ana Mendes", plafond: 4000000, usado: 2900000, cor: "#3B82F6" },
    { id: "D5", nome: "Operações", responsavel: "Ricardo Gomes", plafond: 10000000, usado: 9200000, cor: "#F59E0B" },
    { id: "D6", nome: "Jurídico", responsavel: "Sofia Rodrigues", plafond: 3000000, usado: 1800000, cor: "#8B5CF6" },
    { id: "D7", nome: "Administração", responsavel: "João Silva", plafond: 5000000, usado: 4100000, cor: "#EC4899" },
];

const history = [
    { mes: "Jan", total: 51000000, usado: 38500000 },
    { mes: "Fev", total: 51000000, usado: 41200000 },
    { mes: "Mar", total: 51000000, usado: 41600000 },
];

const fmt = (v: number) =>
    new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 0 }).format(v);

export default function Plafond() {
    const [selected, setSelected] = useState<Department | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [editValue, setEditValue] = useState("");

    const stats = useMemo(() => {
        const totalPlafond = departments.reduce((s, d) => s + d.plafond, 0);
        const totalUsado = departments.reduce((s, d) => s + d.usado, 0);
        const totalDisponivel = totalPlafond - totalUsado;
        const usagePercent = Math.round((totalUsado / totalPlafond) * 100);
        const alertDepts = departments.filter((d) => (d.usado / d.plafond) >= 0.85);
        return { totalPlafond, totalUsado, totalDisponivel, usagePercent, alertDepts };
    }, []);

    const getUsageColor = (pct: number) => {
        if (pct >= 90) return "text-destructive bg-destructive";
        if (pct >= 75) return "text-warning bg-warning";
        return "text-success bg-success";
    };

    const getUsageColorValue = (pct: number) => {
        if (pct >= 90) return "var(--destructive)";
        if (pct >= 75) return "var(--warning)";
        return "var(--success)";
    };

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                icon={Layers}
                title="Gestão de Plafond"
                subtitle="Habilitação e monitorização de limites orçamentais por departamento."
                actions={
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-bold text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                        <Plus size={16} /> NOVO DEPARTAMENTO
                    </button>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Orçamento Consolidado" value={`${(stats.totalPlafond / 1000000).toFixed(0)}M AOA`} icon={Layers} />
                <KPICard title="Execução Total" value={`${(stats.totalUsado / 1000000).toFixed(1)}M AOA`} icon={TrendingUp} change={`${stats.usagePercent}%`} trend={stats.usagePercent > 85 ? "down" : "up"} />
                <KPICard title="Disponibilidade" value={`${(stats.totalDisponivel / 1000000).toFixed(1)}M AOA`} icon={Check} change={`${100 - stats.usagePercent}% livre`} trend="up" accent />
                <KPICard title="Críticos / Alerta" value={`${stats.alertDepts.length}`} subtitle="Acima de 85%" icon={AlertTriangle} trend={stats.alertDepts.length > 0 ? "down" : "up"} />
            </div>

            {/* Global Progress */}
            <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-widest">
                            <Target size={14} className="text-primary" />
                            Execução Orçamental Global — Março 2025
                        </h3>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase mt-1">
                            {fmt(stats.totalUsado)} AOA consumidos de {fmt(stats.totalPlafond)} AOA totais
                        </p>
                    </div>
                    <span className={`text-2xl font-black ${getUsageColor(stats.usagePercent).split(' ')[0]}`}>
                        {stats.usagePercent}%
                    </span>
                </div>
                <div className="h-4 rounded-full bg-muted/20 overflow-hidden p-1 border border-border">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${getUsageColor(stats.usagePercent).split(' ')[1]}`}
                        style={{ width: `${stats.usagePercent}%` }}
                    />
                </div>
                <div className="flex justify-between px-1">
                    {["0%", "Alerta: 75%", "Crítico: 90%", "100%"].map((label, idx) => (
                        <span key={label} className={`text-[10px] font-bold uppercase tracking-wider ${idx === 1 ? 'text-warning' : idx === 2 ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {label}
                        </span>
                    ))}
                </div>
            </div>

            {/* Alerts */}
            {stats.alertDepts.length > 0 && (
                <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="p-2 rounded-lg bg-destructive text-white shadow-lg shadow-destructive/20 animate-pulse">
                        <AlertTriangle size={18} />
                    </div>
                    <div className="flex-1">
                        <p className="text-[13px] font-bold text-destructive">Atenção: {stats.alertDepts.length} departamento(s) próximo do limite orçamental.</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {stats.alertDepts.map((d) => (
                                <span key={d.id} className="px-2 py-1 rounded bg-destructive/10 text-destructive text-[10px] font-bold uppercase ring-1 ring-destructive/20">
                                    {d.nome} ({Math.round((d.usado / d.plafond) * 100)}%)
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Alocação por Departamento</h3>
                        <span className="text-[10px] text-muted-foreground font-bold">{departments.length} UNIDADES</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {departments.map((dept) => {
                            const pct = Math.round((dept.usado / dept.plafond) * 100);
                            const isSelected = selected?.id === dept.id;
                            const colorVal = getUsageColorValue(pct);

                            return (
                                <button
                                    key={dept.id}
                                    onClick={() => setSelected(isSelected ? null : dept)}
                                    className={`w-full text-left p-5 rounded-xl border-2 transition-all hover:bg-card-hover group ${isSelected ? 'border-primary bg-card-hover shadow-xl shadow-primary/10' : 'border-border bg-card'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: dept.cor }} />
                                            <div>
                                                <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{dept.nome}</h4>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">{dept.responsavel}</p>
                                            </div>
                                        </div>
                                        <span className="text-[16px] font-black" style={{ color: colorVal }}>{pct}%</span>
                                    </div>

                                    <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden mb-3">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: colorVal }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <TrendingUp size={12} className="text-destructive" />
                                            <span>USADO: <span className="text-foreground">{fmt(dept.usado)} AOA</span></span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Layers size={12} className="text-primary" />
                                            <span>PLAFOND: <span className="text-foreground">{fmt(dept.plafond)} AOA</span></span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-4">
                    {selected ? (
                        <SectionCard title={selected.nome.toUpperCase()} noPadding>
                            <div className="p-6 space-y-6">
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/10 border border-border">
                                    <div className="p-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Gestor Responsável</p>
                                        <p className="text-[15px] font-bold text-foreground">{selected.responsavel}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { label: "Plafond Aprovado", value: fmt(selected.plafond), icon: Layers, color: "text-foreground" },
                                        { label: "Consumo Efectivo", value: fmt(selected.usado), icon: TrendingUp, color: "text-destructive" },
                                        { label: "Saldo Disponível", value: fmt(selected.plafond - selected.usado), icon: Check, color: "text-success" },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center justify-between p-3 border-b border-border/50 group/row hover:bg-muted/5 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <item.icon size={14} className="text-muted-foreground group-hover/row:text-primary" />
                                                <span className="text-[12px] font-bold text-muted-foreground uppercase">{item.label}</span>
                                            </div>
                                            <span className={`text-[13px] font-black ${item.color}`}>{item.value} AOA</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-border">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[2px] flex items-center gap-2">
                                            <History size={14} className="text-primary" /> Histórico Semestral
                                        </h4>
                                        <span className="text-[10px] text-primary font-bold">VER TUDO →</span>
                                    </div>
                                    <div className="flex items-end justify-between h-20 gap-2">
                                        {history.map((h) => {
                                            const hPct = Math.round((h.usado / h.total) * 100);
                                            return (
                                                <div key={h.mes} className="flex-1 flex flex-col items-center gap-2 group/bar">
                                                    <div className="w-full bg-muted/20 rounded-t-sm relative border-x border-t border-border/30 overflow-hidden h-full flex flex-col justify-end">
                                                        <div
                                                            className="w-full bg-primary/40 group-hover/bar:bg-primary transition-all duration-500 rounded-t-[2px] shadow-sm"
                                                            style={{ height: `${hPct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">{h.mes}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        onClick={() => setEditMode(!editMode)}
                                        className="w-full py-4 rounded-xl border border-primary text-primary font-black text-xs hover:bg-primary hover:text-white transition-all uppercase tracking-widest shadow-lg shadow-primary/5"
                                    >
                                        {editMode ? "CANCELAR EDIÇÃO" : "AJUSTAR ORÇAMENTO"}
                                    </button>
                                    {editMode && (
                                        <div className="mt-4 p-4 rounded-xl bg-card border-2 border-primary animate-in zoom-in-95 duration-200">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase block mb-2">Novo Valor de Plafond (AOA)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    value={editValue || selected.plafond}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="flex-1 bg-muted/20 border border-border rounded-lg px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                                />
                                                <button className="bg-primary text-white p-2 rounded-lg"><Check size={20} /></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SectionCard>
                    ) : (
                        <div className="p-12 rounded-xl border-2 border-dashed border-border bg-card/30 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="p-4 rounded-full bg-muted/10 text-muted-foreground">
                                <Layers size={48} strokeWidth={1} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-foreground">Gestão de Unidades</h4>
                                <p className="text-[11px] font-medium text-muted-foreground max-w-[200px] mt-1">Selecione um departamento para auditar a execução e ajustar limites.</p>
                            </div>
                        </div>
                    )}

                    <SectionCard title="DISTRIBUIÇÃO DE RECURSOS" noPadding>
                        <div className="divide-y divide-border/30">
                            {departments.map((d) => (
                                <div key={d.id} className="flex items-center justify-between p-3.5 hover:bg-muted/5 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: d.cor }} />
                                        <span className="text-[12px] font-bold text-foreground group-hover:text-primary transition-colors">{d.nome}</span>
                                    </div>
                                    <span className="text-[12px] font-black text-muted-foreground">{Math.round((d.usado / d.plafond) * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            </div>
        </div>
    );
}
