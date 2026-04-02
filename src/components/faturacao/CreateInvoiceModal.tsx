import { useState } from "react";
import { Plus, Trash2, X, FileText } from "lucide-react";
import { SectionCard } from "@/components/shared/SectionCard";

interface LineItem {
    id: string;
    descricao: string;
    quantidade: number;
    precoUnit: number;
    ivaPercent: number;
}

const clients = ["Sonangol E.P.", "Unitel S.A.", "BAI", "Angola Telecom", "TAAG", "BFA", "Endiama", "BIC", "Multichoice Angola", "ENSA"];
const BNA_RATE = 850;

const fmt = (v: number, dec = 0) =>
    new Intl.NumberFormat("pt-AO", { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v);

export function CreateInvoiceModal({ onClose }: { onClose: () => void }) {
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { id: "1", descricao: "", quantidade: 1, precoUnit: 0, ivaPercent: 14 },
    ]);
    const [cliente, setCliente] = useState("");
    const [nif, setNif] = useState("");
    const [dataVencimento, setDataVencimento] = useState("2025-04-30");

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

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 py-8 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-4xl bg-card border border-border rounded-xl shadow-2xl relative animate-in zoom-in-95 duration-300">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card-hover/50 rounded-t-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/10 text-primary">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Nova Fatura de Venda</h3>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Série FT 2025/246 · AGT-Compliant</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-8">
                    {/* Client & Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Cliente *</label>
                            <select
                                value={cliente}
                                onChange={(e) => setCliente(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-border bg-muted/20 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            >
                                <option value="">Selecionar cliente…</option>
                                {clients.map((c) => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">NIF</label>
                            <input
                                value={nif}
                                onChange={(e) => setNif(e.target.value)}
                                placeholder="Ex: 5400000000"
                                className="w-full px-4 py-3 rounded-lg border border-border bg-muted/20 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Vencimento</label>
                            <input
                                type="date"
                                value={dataVencimento}
                                onChange={(e) => setDataVencimento(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-border bg-muted/20 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h4 className="text-[13px] font-bold text-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                DITELHES DA FACTURAÇÃO
                            </h4>
                            <button
                                onClick={addItem}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-primary/50 text-xs font-bold text-primary hover:bg-primary/5 transition-all"
                            >
                                <Plus size={14} /> ADICIONAR ITEM
                            </button>
                        </div>

                        <div className="rounded-xl border border-border overflow-hidden bg-muted/10 shadow-inner">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-card-hover/50 text-[10px] font-bold text-primary uppercase tracking-widest border-b border-border">
                                        <th className="px-4 py-3">Descrição do Item</th>
                                        <th className="px-4 py-3 w-20 text-center">Qtd</th>
                                        <th className="px-4 py-3 w-40 text-right">Unitário (AOA)</th>
                                        <th className="px-4 py-3 w-24 text-center">IVA</th>
                                        <th className="px-4 py-3 w-40 text-right">Total Item</th>
                                        <th className="px-4 py-3 w-12"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {lineItems.map((item, idx) => {
                                        const itemTotal = item.quantidade * item.precoUnit * (1 + item.ivaPercent / 100);
                                        return (
                                            <tr key={item.id} className={idx % 2 === 0 ? "bg-transparent" : "bg-muted/5"}>
                                                <td className="px-4 py-3">
                                                    <input
                                                        value={item.descricao}
                                                        onChange={(e) => updateItem(item.id, "descricao", e.target.value)}
                                                        placeholder="Serviço ou produto…"
                                                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-muted-foreground/50"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        value={item.quantidade}
                                                        onChange={(e) => updateItem(item.id, "quantidade", parseInt(e.target.value) || 0)}
                                                        className="w-full bg-transparent border-none text-center focus:ring-0 text-sm font-bold"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        value={item.precoUnit}
                                                        onChange={(e) => updateItem(item.id, "precoUnit", parseFloat(e.target.value) || 0)}
                                                        className="w-full bg-transparent border-none text-right focus:ring-0 text-sm font-bold"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={item.ivaPercent}
                                                        onChange={(e) => updateItem(item.id, "ivaPercent", parseInt(e.target.value))}
                                                        className="w-full bg-transparent border-none text-center focus:ring-0 text-xs font-bold text-primary appearance-none cursor-pointer"
                                                    >
                                                        <option value="0">0%</option>
                                                        <option value="14">14%</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="text-sm font-bold text-foreground">{fmt(itemTotal, 2)}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        disabled={lineItems.length === 1}
                                                        className={`p-1.5 rounded-lg transition-colors ${lineItems.length === 1 ? 'opacity-20 cursor-not-allowed' : 'text-destructive hover:bg-destructive/10'}`}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals Section */}
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-4">
                        <div className="max-w-xs p-4 rounded-xl bg-primary/5 border border-primary/20">
                            <p className="text-[11px] font-bold text-primary uppercase tracking-widest flex items-center gap-2 mb-2">
                                <FileText size={12} /> Compliance Informativo
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Esta fatura será emitida digitalmente conforme as normas da <span className="font-bold text-foreground">AGT</span>.
                                Os valores incluem IVA à taxa legal de 14% para o Regime Geral.
                            </p>
                        </div>

                        <div className="w-full md:w-80 space-y-3">
                            <div className="flex justify-between text-muted-foreground">
                                <span className="text-[13px] font-medium">Subtotal Líquido</span>
                                <span className="text-[13px] font-bold">{fmt(subtotal, 2)} AOA</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span className="text-[13px] font-medium">IVA Total (14%)</span>
                                <span className="text-[13px] font-bold">{fmt(totalIVA, 2)} AOA</span>
                            </div>
                            <div className="pt-3 border-t border-border flex justify-between items-center">
                                <span className="text-lg font-bold text-primary">Total Geral</span>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-primary tracking-tight">{fmt(total, 2)} AOA</p>
                                    <p className="text-[11px] font-bold text-muted-foreground">≈ {fmt(total / BNA_RATE, 2)} USD</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="px-8 py-6 border-t border-border bg-card-hover/30 rounded-b-xl flex flex-wrap gap-4 justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-lg border border-border font-bold text-sm text-muted-foreground hover:bg-muted/50 transition-all"
                    >
                        DESCARTAR
                    </button>
                    <button
                        className="px-6 py-3 rounded-lg border border-primary/30 font-bold text-sm text-primary hover:bg-primary/5 transition-all"
                    >
                        GUARDAR RASCUNHO
                    </button>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-white font-bold text-sm shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all"
                    >
                        <FileText size={18} /> EMITIR FATURA FINAL
                    </button>
                </div>
            </div>
        </div>
    );
}
