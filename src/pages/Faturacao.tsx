import { useState, useMemo } from "react";
import {
    FileText,
    Plus,
    Search,
    Filter,
    Download,
    Eye,
    Trash2,
    ArrowUpRight,
    Clock,
    CheckCircle,
    AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { KPICard } from "@/components/shared/KPICard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CreateInvoiceModal } from "@/components/faturacao/CreateInvoiceModal";
import { InvoiceDetailModal } from "@/components/faturacao/InvoiceDetailModal";

// --- Types & Data ---
interface Invoice {
    id: string;
    serie: string;
    cliente: string;
    nif: string;
    dataEmissao: string;
    dataVencimento: string;
    subtotal: number;
    iva: number;
    total: number;
    estado: "Paga" | "Pendente" | "Vencida" | "Rascunho";
    moeda: "AOA" | "USD";
}

const invoices: Invoice[] = [
    { id: "FT 2025/245", serie: "FT", cliente: "Sonangol E.P.", nif: "5400012345", dataEmissao: "31/03/2025", dataVencimento: "30/04/2025", subtotal: 10964912, iva: 1535088, total: 12500000, estado: "Paga", moeda: "AOA" },
    { id: "FT 2025/244", serie: "FT", cliente: "Unitel S.A.", nif: "5400067890", dataEmissao: "30/03/2025", dataVencimento: "29/04/2025", subtotal: 7675439, iva: 1074561, total: 8750000, estado: "Pendente", moeda: "AOA" },
    { id: "FT 2025/243", serie: "FT", cliente: "BAI", nif: "5400098765", dataEmissao: "29/03/2025", dataVencimento: "28/04/2025", subtotal: 13333333, iva: 1866667, total: 15200000, estado: "Paga", moeda: "AOA" },
    { id: "FT 2025/242", serie: "FT", cliente: "Angola Telecom", nif: "5400011111", dataEmissao: "28/03/2025", dataVencimento: "27/04/2025", subtotal: 5526316, iva: 773684, total: 6300000, estado: "Vencida", moeda: "AOA" },
    { id: "FT 2025/241", serie: "FT", cliente: "TAAG", nif: "5400022222", dataEmissao: "27/03/2025", dataVencimento: "26/04/2025", subtotal: 8596491, iva: 1203509, total: 9800000, estado: "Paga", moeda: "AOA" },
    { id: "FT 2025/240", serie: "FT", cliente: "BFA", nif: "5400033333", dataEmissao: "25/03/2025", dataVencimento: "24/04/2025", subtotal: 6140351, iva: 859649, total: 7000000, estado: "Pendente", moeda: "AOA" },
    { id: "FT 2025/239", serie: "FT", cliente: "Endiama", nif: "5400044444", dataEmissao: "22/03/2025", dataVencimento: "21/04/2025", subtotal: 17543860, iva: 2456140, total: 20000000, estado: "Paga", moeda: "AOA" },
    { id: "FT 2025/238", serie: "FT", cliente: "BIC", nif: "5400055555", dataEmissao: "20/03/2025", dataVencimento: "19/04/2025", subtotal: 4385965, iva: 614035, total: 5000000, estado: "Rascunho", moeda: "AOA" },
];

const BNA_RATE = 850;
const fmt = (v: number) =>
    new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 0 }).format(v);

export default function Faturacao() {
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("Todos");
    const [sortField, setSortField] = useState<"dataEmissao" | "total">("dataEmissao");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [showCreate, setShowCreate] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    const stats = useMemo(() => {
        const totalPago = invoices.filter((i) => i.estado === "Paga").reduce((s, i) => s + i.total, 0);
        const totalPendente = invoices.filter((i) => i.estado === "Pendente").reduce((s, i) => s + i.total, 0);
        const totalVencido = invoices.filter((i) => i.estado === "Vencida").reduce((s, i) => s + i.total, 0);
        const totalEmitido = invoices.reduce((s, i) => s + i.total, 0);
        return { totalPago, totalPendente, totalVencido, totalEmitido };
    }, []);

    const filtered = useMemo(() => {
        return invoices
            .filter((inv) => {
                const matchSearch =
                    inv.id.toLowerCase().includes(search.toLowerCase()) ||
                    inv.cliente.toLowerCase().includes(search.toLowerCase());
                const matchStatus = filterStatus === "Todos" || inv.estado === filterStatus;
                return matchSearch && matchStatus;
            })
            .sort((a: any, b: any) => {
                if (sortField === "total") return sortDir === "asc" ? a.total - b.total : b.total - a.total;
                return sortDir === "asc" ? a.dataEmissao.localeCompare(b.dataEmissao) : b.dataEmissao.localeCompare(a.dataEmissao);
            });
    }, [search, filterStatus, sortField, sortDir]);

    const toggleSort = (f: "dataEmissao" | "total") => {
        if (sortField === f) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortField(f); setSortDir("desc"); }
    };

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                icon={FileText}
                title="Faturação"
                subtitle="Gestão de faturas AGT-compliant · Regime Geral — Março 2025"
                actions={
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-xs font-bold text-muted-foreground hover:bg-muted/30">
                            <Download size={14} /> EXPORTAR
                        </button>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-bold text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                        >
                            <Plus size={16} /> NOVA FATURA
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total Emitido" value={`${(stats.totalEmitido / 1000000).toFixed(1)}M AOA`} icon={FileText} change="+8.2%" trend="up" />
                <KPICard title="Total Cobrado" value={`${(stats.totalPago / 1000000).toFixed(1)}M AOA`} icon={CheckCircle} change={`${invoices.filter(i => i.estado === "Paga").length} pagas`} trend="up" accent />
                <KPICard title="Por Cobrar" value={`${(stats.totalPendente / 1000000).toFixed(1)}M AOA`} icon={Clock} change={`${invoices.filter(i => i.estado === "Pendente").length} pendentes`} trend="down" />
                <KPICard title="Valor Vencido" value={`${(stats.totalVencido / 1000000).toFixed(1)}M AOA`} icon={AlertTriangle} change={`${invoices.filter(i => i.estado === "Vencida").length} vencidas`} trend="down" />
            </div>

            <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex border-b border-border w-full md:w-auto">
                        {["Todos", "Paga", "Pendente", "Vencida", "Rascunho"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-5 py-4 text-[10px] font-bold uppercase tracking-[1.5px] transition-all relative ${filterStatus === status ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {status}
                                {filterStatus === status && (
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
                                placeholder="Pesquisar faturas..."
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <button className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted/30">
                            <Filter size={16} />
                        </button>
                    </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-primary bg-muted/10">
                                    <th className="py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-widest">Série/ID</th>
                                    <th className="py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-widest">Cliente</th>
                                    <th className="py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-widest cursor-pointer hover:bg-primary/5" onClick={() => toggleSort("dataEmissao")}>
                                        Emissão {sortField === "dataEmissao" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                                    </th>
                                    <th className="py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-widest cursor-pointer hover:bg-primary/5" onClick={() => toggleSort("total")}>
                                        Total Bruto {sortField === "total" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                                    </th>
                                    <th className="py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-widest text-center">Estado</th>
                                    <th className="py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-widest text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filtered.map((inv, i) => (
                                    <tr
                                        key={inv.id}
                                        onClick={() => setSelectedInvoice(inv)}
                                        className={`group cursor-pointer transition-colors hover:bg-primary/5 ${i % 2 === 0 ? 'bg-transparent' : 'bg-muted/5'}`}
                                    >
                                        <td className="py-4 px-4">
                                            <p className="text-[12px] font-bold text-primary">{inv.id}</p>
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase">{inv.serie} 2025</p>
                                        </td>
                                        <td className="py-4 px-4">
                                            <p className="text-[13px] font-bold text-foreground">{inv.cliente}</p>
                                            <p className="text-[11px] text-muted-foreground">NIF: {inv.nif}</p>
                                        </td>
                                        <td className="py-4 px-4 text-[12px] font-medium text-muted-foreground">
                                            {inv.dataEmissao}
                                        </td>
                                        <td className="py-4 px-4">
                                            <p className="text-[13px] font-bold text-foreground">{fmt(inv.total)} AOA</p>
                                            <p className="text-[10px] font-bold text-muted-foreground">≈ {fmt(inv.total / BNA_RATE)} USD</p>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <StatusBadge status={inv.estado} />
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => setSelectedInvoice(inv)} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                                                    <Eye size={14} />
                                                </button>
                                                <button className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                                                    <Download size={14} />
                                                </button>
                                                {inv.estado === "Rascunho" && (
                                                    <button className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Compliance Banner */}
            <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-4">
                <ArrowUpRight size={18} className="text-primary shrink-0 mt-0.5" />
                <div>
                    <p className="text-[12px] font-bold text-primary uppercase tracking-widest mb-1">AGT COMPLIANCE · REGIME GERAL</p>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                        As faturas são emitidas seguindo o regime geral de IVA (14%). Certifique-se de que todos os dados do cliente (NIF e Denominação) estão corretos para garantir a validade fiscal dos documentos.
                        Próxima série disponível: <span className="text-foreground font-bold font-mono">FT 2025/246</span>.
                    </p>
                </div>
            </div>

            {showCreate && <CreateInvoiceModal onClose={() => setShowCreate(false)} />}
            {selectedInvoice && <InvoiceDetailModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
        </div>
    );
}
