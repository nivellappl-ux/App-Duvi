import { useState, useEffect } from "react";
import { Plus, Trash2, X, FileText, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface LineItem {
    id: string;
    descricao: string;
    quantidade: number;
    precoUnit: number;
    ivaPercent: number;
}

const BNA_RATE = 850;

const fmt = (v: number, dec = 0) =>
    new Intl.NumberFormat("pt-AO", { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v);

export function CreateInvoiceModal({ onClose, onRefresh }: { onClose: () => void; onRefresh?: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { id: "1", descricao: "", quantidade: 1, precoUnit: 0, ivaPercent: 14 },
    ]);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        const { data } = await supabase.from("customers").select("id, name, nif").order("name");
        setCustomers(data || []);
    };

    const addItem = () =>
        setLineItems([...lineItems, { id: Date.now().toString(), descricao: "", quantidade: 1, precoUnit: 0, ivaPercent: 14 }]);

    const removeItem = (id: string) => {
        if (lineItems.length > 1) setLineItems(lineItems.filter((i) => i.id !== id));
    };

    const updateItem = (id: string, field: keyof LineItem, value: string | number) =>
        setLineItems(lineItems.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

    const subtotal = lineItems.reduce((s, i) => s + i.quantidade * i.precoUnit, 0);
    const totalIVA = lineItems.reduce((s, i) => s + (i.quantidade * i.precoUnit * i.ivaPercent) / 100, 0);
    const total = subtotal + totalIVA;

    const handleEmitir = async () => {
        if (!selectedCustomerId) return toast.error("Selecione um cliente.");
        if (lineItems.some(i => !i.descricao || i.precoUnit <= 0)) return toast.error("Preencha todos os itens corretamente.");

        setIsLoading(true);
        try {
            // 1. Create Invoice Header
            const { data: invoice, error: invError } = await supabase
                .from("invoices")
                .insert({
                    customer_id: selectedCustomerId,
                    due_date: dueDate,
                    subtotal,
                    iva_total: totalIVA,
                    total_amount: total,
                    status: "Pendente"
                })
                .select()
                .single();

            if (invError) throw invError;

            // 2. Create Invoice Items
            const itemsToInsert = lineItems.map(item => ({
                invoice_id: invoice.id,
                description: item.descricao,
                quantity: item.quantidade,
                unit_price: item.precoUnit,
                iva_percent: item.ivaPercent,
                total_price: item.quantidade * item.precoUnit * (1 + item.ivaPercent / 100)
            }));

            const { error: itemsError } = await supabase.from("invoice_items").insert(itemsToInsert);
            if (itemsError) throw itemsError;

            toast.success("Fatura emitida com sucesso!");
            if (onRefresh) onRefresh();
            onClose();
        } catch (error: any) {
            toast.error("Erro ao emitir fatura: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 py-8 overflow-y-auto bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-4xl bg-card border border-border rounded-xl shadow-2xl relative animate-in zoom-in-98 duration-300">
                <div className="flex items-center justify-between px-6 py-5 border-b bg-muted/20">
                    <div className="flex items-center gap-3">
                        <FileText className="text-primary" size={20} />
                        <div>
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Emissão de Documento Fiscal</h3>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Série FT 2025 · Sistema Certificado</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors"><X size={18} /></button>
                </div>

                <div className="p-6 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Cliente Destinatário</label>
                            <select
                                value={selectedCustomerId}
                                onChange={(e) => setSelectedCustomerId(e.target.value)}
                                className="w-full bg-muted/30 border border-border rounded-lg p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Selecionar Cliente...</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.nif || 'S/ NIF'})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">NIF do Destinatário</label>
                            <div className="p-2.5 bg-muted/10 border border-border rounded-lg text-xs font-mono text-muted-foreground">
                                {customers.find(c => c.id === selectedCustomerId)?.nif || "---"}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Data de Vencimento</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full bg-muted/30 border border-border rounded-lg p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-bold text-primary uppercase tracking-[2px]">Itens da Fatura</h4>
                            <Button variant="outline" size="sm" onClick={addItem} className="h-8 text-[10px] font-bold border-dashed">
                                <Plus size={14} className="mr-1" /> ADICIONAR LINHA
                            </Button>
                        </div>

                        <div className="border border-border rounded-xl overflow-hidden bg-muted/5">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-muted/30 border-b border-border">
                                    <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        <th className="p-3">Descrição</th>
                                        <th className="p-3 w-20 text-center">Qtd</th>
                                        <th className="p-3 w-32 text-right">Unitário</th>
                                        <th className="p-3 w-24 text-center">IVA</th>
                                        <th className="p-3 w-32 text-right">Total</th>
                                        <th className="p-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {lineItems.map((item) => (
                                        <tr key={item.id}>
                                            <td className="p-2">
                                                <input
                                                    value={item.descricao}
                                                    onChange={(e) => updateItem(item.id, "descricao", e.target.value)}
                                                    className="w-full bg-transparent border-none focus:ring-0 font-medium"
                                                    placeholder="Descrição do serviço/produto..."
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    value={item.quantidade}
                                                    onChange={(e) => updateItem(item.id, "quantidade", Number(e.target.value))}
                                                    className="w-full bg-transparent border-none focus:ring-0 text-center font-bold"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    value={item.precoUnit}
                                                    onChange={(e) => updateItem(item.id, "precoUnit", Number(e.target.value))}
                                                    className="w-full bg-transparent border-none focus:ring-0 text-right font-bold"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <select
                                                    value={item.ivaPercent}
                                                    onChange={(e) => updateItem(item.id, "ivaPercent", Number(e.target.value))}
                                                    className="w-full bg-transparent border-none focus:ring-0 text-center font-bold text-primary"
                                                >
                                                    <option value="14">14%</option>
                                                    <option value="0">0%</option>
                                                </select>
                                            </td>
                                            <td className="p-2 text-right font-bold text-foreground">
                                                {fmt(item.quantidade * item.precoUnit * (1 + item.ivaPercent / 100), 2)}
                                            </td>
                                            <td className="p-2">
                                                <button onClick={() => removeItem(item.id)} className="text-destructive hover:bg-destructive/10 p-1 rounded-md transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-t pt-6">
                        <div className="max-w-[300px] text-[10px] text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-4">
                            Documento processado por computador. Nos termos do Regime Geral, as faturas enviadas eletronicamente têm validade jurídica plena.
                        </div>
                        <div className="w-full md:w-80 space-y-2">
                            <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                <span>Subtotal</span>
                                <span>{fmt(subtotal, 2)} AOA</span>
                            </div>
                            <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                <span>IVA Total (14%)</span>
                                <span>{fmt(totalIVA, 2)} AOA</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t">
                                <span className="text-sm font-bold text-primary uppercase tracking-widest">Total Geral</span>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-primary">{fmt(total, 2)} AOA</p>
                                    <p className="text-[10px] font-bold text-muted-foreground tracking-widest">≈ {fmt(total / BNA_RATE, 2)} USD</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-muted/10 flex justify-end gap-3 rounded-b-xl">
                    <Button variant="ghost" onClick={onClose} className="text-xs font-bold uppercase tracking-widest">Cancelar</Button>
                    <Button
                        onClick={handleEmitir}
                        disabled={isLoading}
                        className="bg-primary text-white shadow-xl shadow-primary/20 px-10 h-11 text-xs font-bold uppercase tracking-widest hover:scale-[1.02] transition-all"
                    >
                        {isLoading ? "Processando..." : <><Check size={16} className="mr-2" /> Emitir Fatura Final</>}
                    </Button>
                </div>
            </div>
        </div>
    );
}
