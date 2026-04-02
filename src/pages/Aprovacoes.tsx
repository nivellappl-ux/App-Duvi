import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, PlayCircle, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PermissionGate } from "@/components/auth/PermissionGate";

export default function Aprovacoes() {
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("operation_requests")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setRequests(data);
        } catch (error: any) {
            toast.error("Erro ao carregar aprovações: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: 'aprovado' | 'rejeitado', reason?: string) => {
        try {
            const { error } = await supabase
                .from("operation_requests")
                .update({
                    status,
                    rejection_reason: reason,
                    approved_at: status === 'aprovado' ? new Date().toISOString() : null,
                    approver_id: (await supabase.auth.getUser()).data.user?.id
                })
                .eq("id", id);

            if (error) throw error;
            toast.success(`Solicitação ${status === 'aprovado' ? 'aprovada' : 'rejeitada'} com sucesso!`);
            fetchRequests();
        } catch (error: any) {
            toast.error("Erro ao atualizar estado: " + error.message);
        }
    };

    const executeOperation = async (requestId: string) => {
        try {
            // Chamada para a Edge Function de execução segura
            const { data, error } = await supabase.functions.invoke("enterprise-api", {
                body: { action: "execute-approved", requestId }
            });

            if (error) throw error;
            toast.success("Operação executada com sucesso!");
            fetchRequests();
        } catch (error: any) {
            toast.error("Erro na execução: " + error.message);
        }
    };

    const columns = [
        { key: "operation_type", label: "Tipo Operação", render: (val: string) => <span className="capitalize font-bold">{val}</span> },
        { key: "requester_id", label: "Solicitante", render: (val: string) => <span className="text-xs">{val.substring(0, 8)}...</span> },
        { key: "created_at", label: "Data", render: (val: string) => new Date(val).toLocaleString() },
        {
            key: "status",
            label: "Estado Workflow",
            render: (val: any) => (
                <StatusBadge
                    label={val}
                    tone={val === "concluido" ? "success" : val === "aprovado" ? "info" : val === "rejeitado" ? "danger" : "warning"}
                />
            )
        },
        {
            key: "ações",
            label: "Ações Gestão",
            render: (row: any) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0" title="Ver Detalhes">
                        <Eye size={16} />
                    </Button>

                    {row.status === "pendente" && (
                        <PermissionGate permission="finance.approve">
                            <div className="flex gap-1">
                                <Button
                                    onClick={() => handleStatusUpdate(row.id, 'aprovado')}
                                    variant="ghost" size="sm" className="text-success hover:bg-success/10 w-8 h-8 p-0"
                                >
                                    <CheckCircle2 size={16} />
                                </Button>
                                <Button
                                    onClick={() => handleStatusUpdate(row.id, 'rejeitado')}
                                    variant="ghost" size="sm" className="text-danger hover:bg-danger/10 w-8 h-8 p-0"
                                >
                                    <XCircle size={16} />
                                </Button>
                            </div>
                        </PermissionGate>
                    )}

                    {row.status === "aprovado" && (
                        <PermissionGate permission="finance.approve">
                            <Button
                                onClick={() => executeOperation(row.id)}
                                className="bg-primary text-white h-8 px-3 text-xs"
                            >
                                <PlayCircle size={14} className="mr-1" /> Executar
                            </Button>
                        </PermissionGate>
                    )}
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
            <PageHeader
                title="Controlo de Aprovações"
                description="Monitorização e validação de operações financeiras e administrativas."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-warning/5 border-warning/20">
                    <CardContent className="pt-6">
                        <p className="text-xs uppercase font-bold text-warning mb-1">Pendentes</p>
                        <h3 className="text-2xl font-bold">{requests.filter(r => r.status === 'pendente').length}</h3>
                    </CardContent>
                </Card>
                <Card className="bg-info/5 border-info/20">
                    <CardContent className="pt-6">
                        <p className="text-xs uppercase font-bold text-info mb-1">Aprovadas</p>
                        <h3 className="text-2xl font-bold">{requests.filter(r => r.status === 'aprovado').length}</h3>
                    </CardContent>
                </Card>
                <Card className="bg-success/5 border-success/20">
                    <CardContent className="pt-6">
                        <p className="text-xs uppercase font-bold text-success mb-1">Concluídas</p>
                        <h3 className="text-2xl font-bold">{requests.filter(r => r.status === 'concluido').length}</h3>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/70 bg-card/80 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Fila de Trabalho Enterprise</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <DataTable columns={columns as any} rows={requests} isLoading={isLoading} />
                </CardContent>
            </Card>
        </motion.section>
    );
}
