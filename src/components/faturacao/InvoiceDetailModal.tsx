import { X, Download, FileText } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface Invoice {
    id: string;
    serie: string;
    cliente: string;
    nif: string;
    dataEmissao: string;
    dataVencimento: string;
    subtotal: number;
    iva: number;
    total: number;
    estado: "Paga" | "Pendente" | "Vencida" | "Rascunho";
    moeda: "AOA" | "USD";
}

const BNA_RATE = 850;
const fmt = (v: number, dec = 0) =>
    new Intl.NumberFormat("pt-AO", { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v);

export function InvoiceDetailModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card-hover/50 rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary text-white">
                            <FileText size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{invoice.id}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                        {[
                            { label: "Cliente", value: invoice.cliente },
                            { label: "NIF", value: invoice.nif },
                            { label: "Data de Emissão", value: invoice.dataEmissao },
                            { label: "Data de Vencimento", value: invoice.dataVencimento },
                            { label: "Moeda Base", value: invoice.moeda },
                            { label: "Situação", value: invoice.estado, isStatus: true },
                        ].map((f) => (
                            <div key={f.label}>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{f.label}</p>
                                {f.isStatus ? (
                                    <StatusBadge status={f.value as any} />
                                ) : (
                                    <p className="text-[13px] font-bold text-foreground">{f.value}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-5 rounded-xl bg-muted/20 border border-border/50 space-y-3">
                        <div className="flex justify-between items-center text-muted-foreground">
                            <span className="text-[13px] font-medium">Subtotal Líquido</span>
                            <span className="text-[13px] font-bold">{fmt(invoice.subtotal, 2)} AOA</span>
                        </div>
                        <div className="flex justify-between items-center text-muted-foreground">
                            <span className="text-[13px] font-medium">IVA (14%)</span>
                            <span className="text-[13px] font-bold">{fmt(invoice.iva, 2)} AOA</span>
                        </div>
                        <div className="pt-3 border-t border-border flex justify-between items-baseline">
                            <span className="text-[14px] font-bold text-primary">Total Geral</span>
                            <div className="text-right">
                                <span className="text-xl font-bold text-primary">{fmt(invoice.total, 2)} AOA</span>
                                <p className="text-[11px] font-bold text-muted-foreground">≈ {fmt(invoice.total / BNA_RATE, 2)} USD</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                            <Download size={16} /> DOWNLOAD PDF
                        </button>
                        <button onClick={onClose} className="px-6 py-3 rounded-lg border border-border font-bold text-sm text-muted-foreground hover:bg-muted/50 transition-all">
                            FECHAR
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
