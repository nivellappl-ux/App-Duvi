import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Plus, ArrowUpRight, Building2, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/common/DataTable";
import { formatCurrencyAOA } from "@/lib/format";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { toast } from "sonner";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { CreateCustomerModal } from "@/components/clientes/CreateCustomerModal";

export default function Clientes() {
    const [clientes, setClientes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchClientes = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("customers")
                .select("*")
                .order("name", { ascending: true });

            if (error) throw error;
            setClientes(data || []);
        } catch (error: any) {
            toast.error("Erro ao carregar clientes: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = useMemo(() => {
        const total = clientes.length;
        const ativos = clientes.filter(c => c.category !== 'Inativo').length;
        return { total, ativos };
    }, [clientes]);

    const filtered = useMemo(() => {
        return clientes.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.nif && c.nif.includes(searchTerm))
        );
    }, [clientes, searchTerm]);

    const columns = [
        {
            key: "name",
            label: "Nome / Empresa",
            render: (val: string, row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-foreground">{val}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Building2 size={10} /> {row.address || 'Sem endereço'}
                    </span>
                </div>
            )
        },
        { key: "nif", label: "NIF", render: (val: string) => <code className="text-xs font-bold text-primary bg-primary/5 px-1 rounded">{val || '---'}</code> },
        {
            key: "contato",
            label: "Contacto",
            render: (_: any, row: any) => (
                <div className="flex flex-col gap-0.5">
                    {row.email && <span className="text-[11px] flex items-center gap-1 text-muted-foreground"><Mail size={10} /> {row.email}</span>}
                    {row.phone && <span className="text-[11px] flex items-center gap-1 text-muted-foreground"><Phone size={10} /> {row.phone}</span>}
                </div>
            )
        },
        {
            key: "category",
            label: "Categoria",
            render: (val: any) => (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${val === "VIP" ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground"
                    }`}>
                    {val || 'Geral'}
                </span>
            )
        },
        {
            key: "ações",
            label: "",
            render: () => (
                <PermissionGate permission="commercial.manage">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                        <ArrowUpRight size={14} />
                    </Button>
                </PermissionGate>
            )
        }
    ];

    return (
        <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
                <PageHeader
                    title="Gestão de Clientes"
                    description="Base de dados centralizada de clientes e entidades"
                    action={
                        <PermissionGate permission="customer.create">
                            <Button
                                className="bg-primary text-white shadow-lg shadow-primary/20"
                                onClick={() => setShowCreate(true)}
                            >
                                <Plus size={16} className="mr-2" /> Novo Cliente
                            </Button>
                        </PermissionGate>
                    }
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-2">
                <Card className="border-border/70 bg-card/80 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Clientes</p>
                            <h3 className="text-3xl font-bold mt-1 text-foreground">
                                <CountUp end={stats.total} duration={1.5} />
                            </h3>
                        </div>
                        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                            <Users className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/70 bg-card/80 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Carteira Ativa</p>
                            <h3 className="text-3xl font-bold text-primary mt-1">
                                <CountUp end={stats.ativos} duration={1.5} />
                            </h3>
                        </div>
                        <div className="text-primary text-[11px] font-bold flex items-center bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                            <ArrowUpRight className="mr-1 h-3 w-3" /> Produção
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/70 bg-primary/5 border-primary/20 shadow-sm">
                    <CardContent className="p-6 flex flex-col justify-center h-full">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 italic">Duvion Insights</p>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                            A base de dados de clientes está sincronizada com o módulo de faturação para emissão rápida.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/70 bg-card/80 shadow-md overflow-hidden">
                <CardHeader className="pb-4 bg-muted/30 border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Diretório de Parceiros</CardTitle>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Pesquisar por Nome ou NIF..."
                                className="pl-9 h-9 text-xs bg-background/50 border-border focus:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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

            {showCreate && <CreateCustomerModal onClose={() => setShowCreate(false)} onRefresh={fetchClientes} />}
        </motion.section>
    );
}
