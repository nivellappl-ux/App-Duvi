import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSpreadsheet, FileIcon, Settings2, Sparkles, DownloadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Relatorios = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [relatorioGerado, setRelatorioGerado] = useState(false);

    const handleGerar = () => {
        setIsGenerating(true);
        setRelatorioGerado(false);
        setTimeout(() => {
            setIsGenerating(false);
            setRelatorioGerado(true);
        }, 1500);
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6 pb-12"
        >
            <PageHeader
                title="Gerador de Relatórios & IA"
                description="Extração unificada de dados (Financeiro, RH, Impostos) acompanhada por análises descritivas geradas para a Administração."
            />

            <div className="grid gap-6 md:grid-cols-2">

                {/* Painel de Configuração do Relatório */}
                <Card className="border-border/70 shadow-sm col-span-1 border-t-primary border-t-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Settings2 className="w-5 h-5 text-primary" /> Configurar Parâmetros</CardTitle>
                        <CardDescription>Selecione o âmbito e o período de análise para a exportação.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Módulo Alvo</label>
                            <Select defaultValue="consolidado">
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione o módulo alvo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="consolidado">Consolidado Mensal C-Level</SelectItem>
                                    <SelectItem value="financeiro">Mapas Financeiros & Tesouraria</SelectItem>
                                    <SelectItem value="rh">Processamento Salarial (RH)</SelectItem>
                                    <SelectItem value="fiscal">Compliance e Gestão Fiscal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Período Fiscal</label>
                            <Select defaultValue="jan2026">
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Mês a auditar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="jan2026">Janeiro 2026</SelectItem>
                                    <SelectItem value="dez2025">Dezembro 2025</SelectItem>
                                    <SelectItem value="nov2025">Novembro 2025</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="rounded-md border p-4 bg-secondary/10 flex items-start gap-4">
                            <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-sm">Smart Summary Ativado</h4>
                                <p className="text-xs text-muted-foreground mt-1 text-balance">O motor analítico irá juntar um parágrafo descritivo abordando as variações principais (Burn Rate, Margens e Custos).</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-primary hover:bg-primary/90 transition-all font-semibold shadow-md" onClick={handleGerar} disabled={isGenerating}>
                            {isGenerating ? "A processar matriz de dados..." : "Processar e Gerar Documento"}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Output do Relatório */}
                <Card className="border-border/70 shadow-sm col-span-1 bg-card/60 relative overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileIcon className="w-5 h-5 text-muted-foreground" /> Output Gerado</CardTitle>
                        <CardDescription>O resultado do processamento ficará disponível para arquivo.</CardDescription>
                    </CardHeader>

                    <CardContent className="min-h-[250px] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {!relatorioGerado && !isGenerating && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-muted-foreground">
                                    <FileSpreadsheet className="w-12 h-12 mx-auto opacity-20 mb-3" />
                                    <p className="text-sm">A aguardar a geração do relatório...</p>
                                </motion.div>
                            )}

                            {isGenerating && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-primary">
                                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
                                    <p className="text-sm font-medium animate-pulse">A analisar métricas de Janeio 2026...</p>
                                </motion.div>
                            )}

                            {relatorioGerado && (
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4 w-full">
                                    <div className="border border-success/30 bg-success/5 p-4 rounded-lg space-y-3">
                                        <div className="flex items-start justify-between">
                                            <Badge className="bg-success text-success-foreground hover:bg-success">Gerado c/ Sucesso</Badge>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10">EXCEL</Button>
                                                <Button size="sm" className="bg-primary hover:bg-primary/90"><DownloadCloud className="w-4 h-4 mr-2" /> PDF</Button>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground">Relatório_Consolidado_Jan2026.pdf</h3>
                                            <p className="text-xs text-muted-foreground">Tamanho: 1.4 MB • Emitido via Duvion ERP</p>
                                        </div>
                                    </div>

                                    <div className="border-l-4 border-l-primary p-4 bg-primary/5 rounded-r-lg">
                                        <h4 className="text-xs font-bold uppercase text-primary tracking-wider mb-2 flex items-center gap-2"><Sparkles className="w-3 h-3" /> IA Executive Summary</h4>
                                        <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                                            Em Janeiro de 2026, a operação obteve uma <strong className="text-foreground">margem operacional de 22%</strong> e um superavit de saldo corrente.
                                            Os custos de <strong className="text-destructive uppercase">Marketing excederam a quota do Plafond em 14%</strong>, exigindo intervenção para não ferir a liquidez do 1º Trimestre. Recomenda-se a reavaliação dos gastos com Publicidade (Ads).
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

            </div>
        </motion.section>
    );
};

export default Relatorios;
