import { useState, useMemo } from "react";
import { BookOpen, Plus, Search, ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle, Printer, X, Calendar } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";

// --- Types ---
interface CashEntry {
    id: string;
    hora: string;
    descricao: string;
    referencia: string;
    tipo: "Entrada" | "Saída";
    valor: number;
    saldo: number;
    responsavel: string;
}

const EXCHANGE_RATE = 850;

const initialEntries: CashEntry[] = [
    { id: "DC-0045", hora: "08:30", descricao: "Saldo inicial do dia", referencia: "—", tipo: "Entrada", valor: 0, saldo: 5200000, responsavel: "Sistema" },
    { id: "DC-0046", hora: "09:15", descricao: "Recebimento fatura FT 2025/241 — TAAG", referencia: "FT 2025/241", tipo: "Entrada", valor: 9800000, saldo: 15000000, responsavel: "Maria Santos" },
    { id: "DC-0047", hora: "10:00", descricao: "Pagamento de Material de Escritório", referencia: "DES-2025/0039", tipo: "Saída", valor: 450000, saldo: 14550000, responsavel: "Pedro Costa" },
    { id: "DC-0048", hora: "11:30", descricao: "Recebimento fatura FT 2025/243 — BAI", referencia: "FT 2025/243", tipo: "Entrada", valor: 15200000, saldo: 29750000, responsavel: "Maria Santos" },
    { id: "DC-0049", hora: "14:00", descricao: "Adiantamento de despesa — Transporte", referencia: "—", tipo: "Saída", valor: 120000, saldo: 29630000, responsavel: "João Silva" },
    { id: "DC-0050", hora: "15:45", descricao: "Pagamento parcial fornecedor — Electro", referencia: "DES-2025/0040", tipo: "Saída", valor: 3000000, saldo: 26630000, responsavel: "Ana Mendes" },
    { id: "DC-0051", hora: "16:20", descricao: "Recebimento serviços — Sonangol", referencia: "FT 2025/245", tipo: "Entrada", valor: 12500000, saldo: 39130000, responsavel: "Maria Santos" },
];

const DATES = ["29/03/2025", "30/03/2025", "31/03/2025"];

const fmt = (v: number) =>
    new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 0 }).format(v);

export default function DiarioCaixa() {
    const [dateIndex, setDateIndex] = useState(2);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [newEntry, setNewEntry] = useState({
        descricao: "",
        referencia: "",
        tipo: "Entrada" as "Entrada" | "Saída",
        valor: "",
        responsavel: "",
    });

    const currentDate = DATES[dateIndex];

    const stats = useMemo(() => {
        const entries = initialEntries;
        const totalEntradas = entries.filter((e) => e.tipo === "Entrada").reduce((s, e) => s + e.valor, 0);
        const totalSaidas = entries.filter((e) => e.tipo === "Saída").reduce((s, e) => s + e.valor, 0);
        const saldoFinal = entries[entries.length - 1]?.saldo || 0;
        return { totalEntradas, totalSaidas, saldoFinal };
    }, []);

    const filtered = useMemo(() => {
        return initialEntries.filter(
            (e) =>
                e.descricao.toLowerCase().includes(search.toLowerCase()) ||
                e.referencia.toLowerCase().includes(search.toLowerCase()) ||
                e.responsavel.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                icon={BookOpen}
                title="Diário de Caixa"
                subtitle={`Registo cronológico de movimentos financeiros · ${currentDate}`}
                actions={
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted/30">
                            <Printer size={16} />
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-bold text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                        >
                            <Plus size={16} /> NOVO MOVIMENTO
                        </button>
                    </div>
                }
            />

            {/* Date Navigator */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card shadow-sm">
                <button
                    onClick={() => setDateIndex(Math.max(0, dateIndex - 1))}
                    disabled={dateIndex === 0}
                    className="p-3 rounded-lg border border-border text-muted-foreground hover:bg-muted/30 disabled:opacity-20 transition-all"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="text-center group cursor-pointer">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Calendar size={16} className="text-primary" />
                        <h3 className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{currentDate}</h3>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[2px]">Terça-feira · Março 2025</p>
                </div>
                <button
                    onClick={() => setDateIndex(Math.min(DATES.length - 1, dateIndex + 1))}
                    disabled={dateIndex === DATES.length - 1}
                    className="p-3 rounded-lg border border-border text-muted-foreground hover:bg-muted/30 disabled:opacity-20 transition-all"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-6 rounded-xl border border-border bg-card hover:border-success/30 transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-success/10 text-success group-hover:scale-110 transition-transform">
                            <ArrowUpCircle size={18} />
                        </div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Total Entradas</p>
                    </div>
                    <p className="text-3xl font-black text-success tracking-tight">{fmt(stats.totalEntradas)}</p>
                    <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">AOA (Cash In)</p>
                </div>

                <div className="p-6 rounded-xl border border-border bg-card hover:border-destructive/30 transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-destructive/10 text-destructive group-hover:scale-110 transition-transform">
                            <ArrowDownCircle size={18} />
                        </div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Total Saídas</p>
                    </div>
                    <p className="text-3xl font-black text-destructive tracking-tight">{fmt(stats.totalSaidas)}</p>
                    <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">AOA (Cash Out)</p>
                </div>

                <div className="p-6 rounded-xl border-2 border-primary/20 bg-primary/5 hover:border-primary/40 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -mr-8 -mt-8 rounded-full blur-2xl" />
                    <div className="flex items-center gap-3 mb-4 relative">
                        <div className="p-2 rounded-lg bg-primary text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                            <BookOpen size={18} />
                        </div>
                        <p className="text-[11px] font-bold text-primary uppercase tracking-widest">Saldo de Fecho</p>
                    </div>
                    <p className="text-3xl font-black text-primary tracking-tight relative">{fmt(stats.saldoFinal)}</p>
                    <div className="flex items-center gap-2 mt-1 relative">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">AOA (Final Balance)</p>
                        <span className="text-[10px] font-bold text-primary/80">≈ {fmt(Math.round(stats.saldoFinal / EXCHANGE_RATE))} USD</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-end">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Pesquisar movimentos..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>

                <SectionCard title="" noPadding>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-primary bg-muted/10">
                                    <th className="py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-widest">Hora / Ref</th>
                                    <th className="py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-widest">Descrição detalhada</th>
                                    <th className="py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-widest text-center">Tipo</th>
                                    <th className="py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-widest text-right">Valor Movimento</th>
                                    <th className="py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-widest text-right">Saldo Acumulado</th>
                                    <th className="py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-widest">Responsável</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filtered.map((entry, i) => (
                                    <tr key={entry.id} className={`group hover:bg-primary/5 transition-colors ${i % 2 === 0 ? 'bg-transparent' : 'bg-muted/5'}`}>
                                        <td className="py-4 px-4">
                                            <p className="text-[12px] font-mono font-bold text-muted-foreground">{entry.hora}</p>
                                            <p className="text-[10px] font-bold text-primary uppercase">{entry.id}</p>
                                        </td>
                                        <td className="py-4 px-4">
                                            <p className="text-[13px] font-bold text-foreground">{entry.descricao}</p>
                                            <p className="text-[11px] text-muted-foreground">REF: {entry.referencia}</p>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <StatusBadge status={entry.tipo} />
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <p className={`text-[13px] font-black ${entry.tipo === 'Entrada' ? 'text-success' : 'text-destructive'}`}>
                                                {entry.tipo === 'Entrada' ? '+' : '-'}{fmt(entry.valor)}
                                            </p>
                                        </td>
                                        <td className="py-4 px-4 text-right text-[13px] font-bold text-foreground">
                                            {fmt(entry.saldo)}
                                        </td>
                                        <td className="py-4 px-4 text-[12px] font-medium text-muted-foreground">
                                            {entry.responsavel}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>
            </div>

            {/* New Movement Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card-hover/50 rounded-t-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary text-white">
                                    <Plus size={18} />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">Novo Movimento</h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-3">
                                {(["Entrada", "Saída"] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setNewEntry({ ...newEntry, tipo: t })}
                                        className={`py-4 rounded-xl border-2 transition-all font-bold text-sm flex flex-col items-center gap-2 ${newEntry.tipo === t
                                                ? (t === "Entrada" ? "border-success bg-success/5 text-success shadow-lg shadow-success/10" : "border-destructive bg-destructive/5 text-destructive shadow-lg shadow-destructive/10")
                                                : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
                                            }`}
                                    >
                                        {t === "Entrada" ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                                        {t.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                {[
                                    { label: "Descrição do Lançamento", key: "descricao", type: "text", placeholder: "Ex: Pagamento Fornecedor X" },
                                    { label: "Referência Documental", key: "referencia", type: "text", placeholder: "Ex: FT 2025/123" },
                                    { label: "Valor do Movimento (AOA)", key: "valor", type: "number", placeholder: "0.00" },
                                    { label: "Nome do Responsável", key: "responsavel", type: "text", placeholder: "Seu nome..." },
                                ].map((field) => (
                                    <div key={field.key}>
                                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{field.label}</label>
                                        <input
                                            type={field.type}
                                            value={(newEntry as Record<string, string>)[field.key]}
                                            onChange={(e) => setNewEntry({ ...newEntry, [field.key]: e.target.value })}
                                            placeholder={field.placeholder}
                                            className="w-full px-4 py-3 rounded-lg border border-border bg-muted/20 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 rounded-lg border border-border font-bold text-sm text-muted-foreground hover:bg-muted/50 transition-all"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                                >
                                    REGISTAR MOVIMENTO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
