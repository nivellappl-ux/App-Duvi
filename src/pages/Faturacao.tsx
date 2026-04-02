import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    FileText,
    Search,
    Plus,
    Download,
    Filter,
    MoreHorizontal,
    Eye,
    Printer,
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingUp,
    Shield,
    TrendingDown,
    ChevronRight,
    Edit2,
    ArrowUpRight,
    CheckCircle,
    AlertTriangle
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { CreateInvoiceModal } from "@/components/faturacao/CreateInvoiceModal";

const fmt = (v: number) =>
    new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(v);

export default function Faturacao() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("Todos");
    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("invoices")
                .select(`
                    *,
                    customers (
                        name,
                        nif
                    )
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setInvoices(data || []);
        } catch (error: any) {
            toast.error("Erro ao carregar faturas: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = useMemo(() => {
        const totalEmitido = invoices.reduce((s, i) => s + (Number(i.total_amount) || 0), 0);
        const totalPago = invoices.filter(i => i.status === "Paga").reduce((s, i) => s + (Number(i.total_amount) || 0), 0);
        const totalPendente = invoices.filter(i => i.status === "Pendente").reduce((s, i) => s + (Number(i.total_amount) || 0), 0);
        const count = invoices.length;
        return { totalEmitido, totalPago, totalPendente, count };
    }, [invoices]);

    const filtered = useMemo(() => {
        return invoices.filter((inv) => {
            const matchSearch =
                inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
                inv.customers?.name?.toLowerCase().includes(search.toLowerCase());
            const matchStatus = filterStatus === "Todos" || inv.status === filterStatus;
            return matchSearch && matchStatus;
        });
    }, [invoices, search, filterStatus]);

    const columns = [
        {
            key: "invoice_number",
            label: "Série / ID",
            render: (val: string) => <span className="font-bold text-primary">{val || 'Rascunho'}</span>
        },
        {
            key: "customer",
            label: "Cliente",
            render: (_: any, row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold">{row.customers?.name || 'Venda a Dinheiro'}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">NIF: {row.customers?.nif || '---'}</span>
                </div>
            )
        },
        {
            key: "issue_date",
            label: "Emissão",
            render: (val: string) => new Date(val).toLocaleDateString()
        },
        {
            key: "total_amount",
            label: "Total Bruto",
            render: (val: number) => <span className="font-bold">{fmt(val)}</span>
        },
        {
            key: "status",
            label: "Estado",
            render: (val: any) => (
                <StatusBadge
                    label={val}
                    tone={val === "Paga" ? "success" : val === "Pendente" ? "warning" : val === "Vencida" ? "danger" : "neutral"}
                />
            )
        },
        {
            key: "ações",
            label: "",
            render: (row: any) => (
                <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-primary">
                        <Download size={14} />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 pb-12"
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <PageHeader
                    title="Faturação & Vendas"
                    description="Gestão de faturas, proformas e notas de crédito AGT-compliant"
                    action={
                        <PermissionGate permission="invoice.create">
                            <Button
                                className="bg-primary text-white shadow-lg shadow-primary/20"
                                onClick={() => setShowCreate(true)}
                            >
                                <Plus size={16} className="mr-2" /> Emitir Fatura
                            </Button>
                        </PermissionGate>
                    }
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-card shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <FileText className="text-muted-foreground" size={16} />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Emitido</span>
                        </div>
                        <h3 className="text-2xl font-bold">{fmt(stats.totalEmitido)}</h3>
                    </CardContent>
                </Card>
                <Card className="bg-success/5 border-success/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <CheckCircle className="text-success" size={16} />
                            <span className="text-[10px] font-bold text-success uppercase tracking-widest">Total Cobrado</span>
                        </div>
                        <h3 className="text-2xl font-bold text-success">{fmt(stats.totalPago)}</h3>
                    </CardContent>
                </Card>
                <Card className="bg-warning/5 border-warning/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <Clock className="text-warning" size={16} />
                            <span className="text-[10px] font-bold text-warning uppercase tracking-widest">Pendente</span>
                        </div>
                        <h3 className="text-2xl font-bold text-warning">{fmt(stats.totalPendente)}</h3>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <ArrowUpRight className="text-primary" size={16} />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Volume (Docs)</span>
                        </div>
                        <h3 className="text-2xl font-bold text-primary">{stats.count}</h3>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/70 bg-card/80 shadow-md overflow-hidden">
                <CardHeader className="bg-muted/30 border-b pb-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex gap-2">
                            {["Todos", "Paga", "Pendente", "Vencida"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${filterStatus === s ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Pesquisar faturas ou clientes..."
                                className="pl-9 h-9 text-xs bg-background/50"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <DataTable
                        columns={columns as any}
                        rows={filtered}
                        isLoading={isLoading}
                    />
                </CardContent>
            </Card>

            <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-4">
                <AlertTriangle size={18} className="text-primary shrink-0 mt-0.5" />
                <div>
                    <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">AGT COMPLIANCE · REGIME GERAL</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Sistema certificado para o mercado angolano. A numeração das faturas é sequencial e irreversível por ano fiscal.
                        A anulação de documentos requer motivo justificado no log de auditoria.
                    </p>
                </div>
            </div>

            {showCreate && <CreateInvoiceModal onClose={() => setShowCreate(false)} onRefresh={fetchInvoices} />}
        </motion.section>
    );
}
