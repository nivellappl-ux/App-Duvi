import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateAO } from "@/lib/format";
import { Folder, Upload, FileText, Download, FilePlus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

// --- MOCK DATABASE DOCUMENTAL ---
const mockPastas = [
    { id: "FP-Emitidas", nome: "Faturas Emitidas", cor: "border-primary", qtd: 145 },
    { id: "FP-Recebidas", nome: "Faturas de Fornecedores", cor: "border-warning", qtd: 82 },
    { id: "RH-Recibos", nome: "Processamentos Salariais", cor: "border-success", qtd: 36 },
    { id: "TX-Impostos", nome: "Comprovativos de IVA/IRT", cor: "border-destructive", qtd: 24 },
];

const mockFicheiros = [
    { id: "DOC-2026-101", nome: "Fatura_FVD26_01_Vodacom.pdf", pasta: "Faturas de Fornecedores", data: formatDateAO(new Date()), tamanho: "1.2 MB" },
    { id: "DOC-2026-102", nome: "Certidao_DLI_Jan2026.pdf", pasta: "Comprovativos de IVA/IRT", data: formatDateAO(new Date(Date.now() - 86400000)), tamanho: "450 KB" },
    { id: "DOC-2026-103", nome: "Recibo_Vencimentos_Jan2026.pdf", pasta: "Processamentos Salariais", data: formatDateAO(new Date(Date.now() - 172800000)), tamanho: "2.8 MB" },
    { id: "DOC-2026-104", nome: "Fatura_FT2026_08_ClienteXPTO.pdf", pasta: "Faturas Emitidas", data: formatDateAO(new Date(Date.now() - 259200000)), tamanho: "890 KB" },
];

const Documentos = () => {
    const [pesquisa, setPesquisa] = useState("");

    const ficheirosFiltrados = mockFicheiros.filter(f => f.nome.toLowerCase().includes(pesquisa.toLowerCase()));

    const colunas = [
        { key: "nome", label: "Nome do Ficheiro", render: (val: any) => <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground" /><span className="font-medium text-primary hover:underline cursor-pointer">{val}</span></div> },
        { key: "pasta", label: "Diretório", render: (val: any) => <Badge variant="secondary" className="font-normal">{val}</Badge> },
        { key: "data", label: "Data de Upload" },
        { key: "tamanho", label: "Tamanho" },
        { key: "acoes", label: "Ações", render: () => <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button> }
    ];

    return (
        <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6 pb-12"
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <PageHeader
                    title="Cofre Digital de Documentos"
                    description="Arquivo centralizado para faturas, recibos e documentos fiscais com pesquisa instantânea."
                />
                <div className="flex gap-2">
                    <Button variant="outline" className="bg-background">
                        <FilePlus className="mr-2 h-4 w-4" /> Nova Pasta
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90">
                        <Upload className="mr-2 h-4 w-4" /> Enviar Documento
                    </Button>
                </div>
            </div>

            {/* Grid de Pastas Visuais */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {mockPastas.map(pasta => (
                    <Card key={pasta.id} className={`border-l-4 ${pasta.cor} hover:shadow-md transition-all cursor-pointer bg-card/50 hover:bg-card`}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-secondary/50 rounded-lg">
                                    <Folder className="w-6 h-6 text-foreground" fill="currentColor" fillOpacity={0.2} />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{pasta.nome}</p>
                                    <p className="text-xs text-muted-foreground">{pasta.qtd} Ficheiros</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabela de Arquivos Recentes */}
            <Card className="border-border/70 shadow-sm mt-8">
                <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Últimos Documentos Inseridos</CardTitle>
                        <CardDescription>O acesso aos ficheiros reflete as suas permissões ativas.</CardDescription>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Pesquisar faturas..."
                            className="pl-9 h-9 bg-secondary/20"
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    {ficheirosFiltrados.length > 0 ? (
                        <DataTable columns={colunas as any} rows={ficheirosFiltrados} />
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="w-12 h-12 mx-auto opacity-20 mb-3" />
                            <p>Nenhum documento encontrado.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

        </motion.section>
    );
};

export default Documentos;
