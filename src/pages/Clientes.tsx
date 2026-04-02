import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, PlusCircle, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/common/DataTable";
import { formatCurrencyAOA } from "@/lib/format";
import { motion } from "framer-motion";
import CountUp from "react-countup";

// Mock Data
const mockClientes = [
    { id: "CL-01", nome: "Empresa Alpha Lda", nif: "5000000000", faturado: formatCurrencyAOA(1500000), status: "Ativo", ultPagamento: "15/03/2026" },
    { id: "CL-02", nome: "Tech Solutions AO", nif: "5000000001", faturado: formatCurrencyAOA(4500000), status: "Ativo", ultPagamento: "28/03/2026" },
    { id: "CL-03", nome: "Comércio Geral Silva", nif: "5000000002", faturado: formatCurrencyAOA(320000), status: "Inativo", ultPagamento: "10/01/2026" },
    { id: "CL-04", nome: "Novo Cliente Lda", nif: "5000000003", faturado: formatCurrencyAOA(0), status: "Pendente", ultPagamento: "-" },
];

const Clientes = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const columns = [
        { key: "nome", label: "Nome" },
        { key: "nif", label: "NIF" },
        { key: "faturado", label: "Total Faturado" },
        { key: "ultPagamento", label: "Último Pagamento" },
        {
            key: "status",
            label: "Estado",
            render: (val: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${val === "Ativo" ? "bg-success/20 text-success" :
                        val === "Inativo" ? "bg-destructive/20 text-destructive" :
                            "bg-warning/20 text-warning"
                    }`}>
                    {val}
                </span>
            )
        }
    ];

    const filteredClientes = mockClientes.filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || c.nif.includes(searchTerm)
    );

    return (
        <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <PageHeader
                    title="Gestão de Clientes"
                    description="CRM básico com histórico de transações e faturação por cliente."
                />
                <Button className="shrink-0 bg-primary/90 hover:bg-primary shadow-md">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Novo Cliente
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card className="border-border/70 bg-card/80 shadow-sm transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Clientes</p>
                            <h3 className="text-2xl font-bold mt-2"><CountUp end={142} duration={2} /></h3>
                        </div>
                        <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                            <Users className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/70 bg-card/80 shadow-sm transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Clientes Ativos</p>
                            <h3 className="text-2xl font-bold text-success mt-2"><CountUp end={89} duration={2} /></h3>
                        </div>
                        <div className="text-success text-sm font-medium flex items-center bg-success/10 px-2 py-1 rounded">
                            <ArrowUpRight className="mr-1 h-4 w-4" /> +12%
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/70 bg-card/80 shadow-sm transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Em Risco (Inativos)</p>
                            <h3 className="text-2xl font-bold text-destructive mt-2"><CountUp end={24} duration={2} /></h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/70 bg-card/80 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Diretório</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Pesquisar cliente ou NIF..."
                                className="pl-8 bg-background"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns as any} rows={filteredClientes} />
                </CardContent>
            </Card>
        </motion.section>
    );
};

export default Clientes;
