import { useState, useMemo } from "react";
import { Building2, Plus, Search, ArrowUpRight, ArrowDownRight, RefreshCw, Eye, EyeOff, Globe, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";

// --- Types ---
interface BankAccount {
    id: string;
    banco: string;
    iban: string;
    moeda: "AOA" | "USD" | "EUR";
    saldo: number;
    tipo: string;
    cor: string;
}

interface Transaction {
    id: string;
    contaId: string;
    data: string;
    descricao: string;
    tipo: "credito" | "debito";
    valor: number;
    saldoApos: number;
    referencia?: string;
}

const BNA_RATE = 850;

const bankAccounts: BankAccount[] = [
    { id: "BAI-1", banco: "BAI", iban: "AO06 0040 0000 1234 5678 9012 3", moeda: "AOA", saldo: 45800000, tipo: "Conta Corrente", cor: "#2563EB" },
    { id: "BFA-1", banco: "BFA", iban: "AO06 1234 5678 9012 3456 7890 1", moeda: "AOA", saldo: 32500000, tipo: "Conta Corrente", cor: "#3B82F6" },
    { id: "BIC-1", banco: "BIC", iban: "AO06 0001 0002 0003 0004 0005 6", moeda: "AOA", saldo: 28900000, tipo: "Conta Poupança", cor: "#10B981" },
    { id: "BAI-2", banco: "BAI", iban: "AO06 0040 0000 5432 1876 0912 7", moeda: "USD", saldo: 125000, tipo: "Conta em Divisas", cor: "#2563EB" },
    { id: "BFA-2", banco: "BFA", iban: "AO06 1234 5678 9012 0011 2233 4", moeda: "EUR", saldo: 48000, tipo: "Conta em Divisas", cor: "#3B82F6" },
];

const transactions: Transaction[] = [
    { id: "TXN-001", contaId: "BAI-1", data: "31/03/2025", descricao: "Recebimento FT 2025/245 — Sonangol", tipo: "credito", valor: 12500000, saldoApos: 45800000, referencia: "FT 2025/245" },
    { id: "TXN-002", contaId: "BAI-1", data: "30/03/2025", descricao: "Pagamento Aluguel Março", tipo: "debito", valor: 2500000, saldoApos: 33300000, referencia: "ALG-MAR" },
    { id: "TXN-003", contaId: "BAI-1", data: "29/03/2025", descricao: "Recebimento FT 2025/243 — BAI", tipo: "credito", valor: 15200000, saldoApos: 35800000, referencia: "FT 2025/243" },
    { id: "TXN-004", contaId: "BFA-1", data: "31/03/2025", descricao: "Pagamento Fornecedor Electro Services", tipo: "debito", valor: 8500000, saldoApos: 32500000, referencia: "DES-2025/0040" },
    { id: "TXN-005", contaId: "BFA-1", data: "28/03/2025", descricao: "Recebimento FT 2025/241 — TAAG", tipo: "credito", valor: 9800000, saldoApos: 41000000, referencia: "FT 2025/241" },
    { id: "TXN-006", contaId: "BIC-1", data: "31/03/2025", descricao: "Transferência interna — BIC", tipo: "credito", valor: 5000000, saldoApos: 28900000 },
    { id: "TXN-007", contaId: "BAI-2", data: "30/03/2025", descricao: "Recebimento serviços — Contrato USD", tipo: "credito", valor: 15000, saldoApos: 125000 },
];

const fmt = (v: number) =>
    new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 0 }).format(v);

const moedaSymbol: Record<string, string> = { AOA: "AOA", USD: "$", EUR: "€" };

export default function ContaBancaria() {
    const [selectedAccount, setSelectedAccount] = useState<BankAccount>(bankAccounts[0]);
    const [search, setSearch] = useState("");
    const [hideBalances, setHideBalances] = useState(false);

    const stats = useMemo(() => {
        const totalAOA = bankAccounts.filter((a) => a.moeda === "AOA").reduce((s, a) => s + a.saldo, 0);
        const totalUSD = bankAccounts.filter((a) => a.moeda === "USD").reduce((s, a) => s + a.saldo, 0);
        const totalEUR = bankAccounts.filter((a) => a.moeda === "EUR").reduce((s, a) => s + a.saldo, 0);
        const totalEquivAOA = totalAOA + totalUSD * BNA_RATE + totalEUR * BNA_RATE * 0.93;
        return { totalAOA, totalUSD, totalEUR, totalEquivAOA };
    }, []);

    const accountTransactions = useMemo(() => {
        return transactions.filter(
            (t) =>
                t.contaId === selectedAccount.id &&
                (t.descricao.toLowerCase().includes(search.toLowerCase()) ||
                    (t.referencia || "").toLowerCase().includes(search.toLowerCase()))
        );
    }, [selectedAccount, search]);

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                icon={Building2}
                title="Gestão de Contas"
                subtitle="Administração centralizada de ativos bancários e fluxos de caixa."
                actions={
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setHideBalances(!hideBalances)}
                            className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted/30 transition-all"
                            title={hideBalances ? "Mostrar Saldos" : "Ocultar Saldos"}
                        >
                            {hideBalances ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-bold text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                            <Plus size={16} /> NOVA CONTA
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 p-6 rounded-xl border-2 border-primary/20 bg-primary/5 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-10 -mt-10 rounded-full blur-3xl transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="flex items-center gap-2 text-primary mb-3">
                            <Globe size={18} />
                            <p className="text-[11px] font-bold uppercase tracking-widest">Saldo Consolidado (equiv. AOA)</p>
                        </div>
                        <p className="text-4xl font-black text-foreground tracking-tighter">
                            {hideBalances ? "••••••••••" : `${fmt(Math.round(stats.totalEquivAOA))} AOA`}
                        </p>
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-primary/20">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Taxa Consultiva BNA:</p>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-primary">1 USD = {BNA_RATE} AOA</span>
                                <span className="text-[10px] font-black text-primary">1 EUR = {Math.round(BNA_RATE * 1.05)} AOA</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:border-primary/30 transition-all">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Disponível AOA</p>
                    <p className="text-2xl font-black text-foreground">
                        {hideBalances ? "•••••••" : fmt(stats.totalAOA)}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">3 Contas Activadas</p>
                </div>

                <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:border-primary/30 transition-all">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Disponível USD</p>
                    <p className="text-2xl font-black text-foreground">
                        {hideBalances ? "•••••••" : `$ ${fmt(stats.totalUSD)}`}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">Taxa de conversão BNA</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Contas Registadas</h3>
                        <span className="text-[10px] font-bold text-primary">{bankAccounts.length} ACTIVAS</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {bankAccounts.map((account) => (
                            <button
                                key={account.id}
                                onClick={() => setSelectedAccount(account)}
                                className={`w-full text-left p-5 rounded-xl border-2 transition-all group ${selectedAccount.id === account.id ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10' : 'border-border bg-card hover:bg-card-hover'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black shadow-sm"
                                            style={{ backgroundColor: `${account.cor}20`, color: account.cor }}
                                        >
                                            {account.banco}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{account.banco}</p>
                                            <p className="text-[11px] font-bold text-muted-foreground uppercase">{account.tipo}</p>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black shadow-sm" style={{ backgroundColor: `${account.cor}20`, color: account.cor }}>
                                        {account.moeda}
                                    </span>
                                </div>
                                <p className="text-[12px] font-mono text-muted-foreground mb-4 opacity-60 tracking-wider">
                                    {account.iban}
                                </p>
                                <div className="flex items-end justify-between">
                                    <p className="text-xl font-black text-foreground">
                                        {hideBalances ? "••••••••" : `${moedaSymbol[account.moeda]} ${fmt(account.saldo)}`}
                                    </p>
                                    <ArrowUpRight size={18} className={`text-muted-foreground transition-all transform ${selectedAccount.id === account.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-y-2'}`} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <SectionCard
                        title={`Histórico — ${selectedAccount.banco} (${selectedAccount.moeda})`}
                        subtitle={`${accountTransactions.length} movimentos registados`}
                        noPadding
                        actions={
                            <div className="relative w-48">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Filtrar movimentos..."
                                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-muted/20 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        }
                    >
                        {accountTransactions.length === 0 ? (
                            <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="p-4 rounded-full bg-muted/10 text-muted-foreground">
                                    <CreditCard size={48} strokeWidth={1} />
                                </div>
                                <p className="text-sm font-bold text-muted-foreground">Nenhum movimento encontrado para esta conta.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {accountTransactions.map((txn) => (
                                    <div key={txn.id} className="p-5 hover:bg-primary/5 transition-all group cursor-pointer">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${txn.tipo === "credito" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                                                        }`}
                                                >
                                                    {txn.tipo === "credito" ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-bold text-foreground group-hover:text-primary transition-colors">{txn.descricao}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[11px] font-bold text-muted-foreground uppercase">{txn.data}</span>
                                                        {txn.referencia && (
                                                            <>
                                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                                <span className="text-[11px] font-black text-primary uppercase">{txn.referencia}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-[15px] font-black ${txn.tipo === "credito" ? "text-success" : "text-destructive"}`}>
                                                    {txn.tipo === "credito" ? "+" : "-"}{moedaSymbol[selectedAccount.moeda]} {fmt(txn.valor)}
                                                </p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                                                    Saldo: {hideBalances ? "•••••" : fmt(txn.saldoApos)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>
                </div>
            </div>
        </div>
    );
}
