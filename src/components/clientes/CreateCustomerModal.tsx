import { useState } from "react";
import { X, UserPlus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateCustomerModal({ onClose, onRefresh }: { onClose: () => void; onRefresh?: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        nif: "",
        email: "",
        phone: "",
        address: "",
        category: "Geral"
    });

    const handleSave = async () => {
        if (!formData.name) return toast.error("O nome é obrigatório.");

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from("customers")
                .insert(formData);

            if (error) throw error;

            toast.success("Cliente registado com sucesso!");
            if (onRefresh) onRefresh();
            onClose();
        } catch (error: any) {
            toast.error("Erro ao registar cliente: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="px-6 py-4 border-b bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <UserPlus className="text-primary" size={18} />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Registar Novo Parceiro</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition-colors"><X size={18} /></button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nome / Denominação Social *</label>
                        <Input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Sonangol E.P."
                            className="text-xs"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">NIF (Opcional)</label>
                            <Input
                                value={formData.nif}
                                onChange={e => setFormData({ ...formData, nif: e.target.value })}
                                placeholder="54000..."
                                className="text-xs font-mono"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Categoria</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full h-9 bg-background border border-input rounded-md px-3 text-xs font-medium focus:ring-1 focus:ring-primary outline-none"
                            >
                                <option value="Geral">Geral</option>
                                <option value="VIP">VIP</option>
                                <option value="Retalho">Retalho</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email</label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="contacto@cliente.ao"
                                className="text-xs"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Telefone</label>
                            <Input
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+244..."
                                className="text-xs"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Endereço Fiscal</label>
                        <Input
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Rua, Cidade, Província"
                            className="text-xs"
                        />
                    </div>
                </div>

                <div className="p-4 border-t bg-muted/10 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose} size="sm" className="text-[10px] font-bold uppercase">Descartar</Button>
                    <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        size="sm"
                        className="bg-primary text-white shadow-lg shadow-primary/20 text-[10px] font-bold uppercase tracking-widest"
                    >
                        {isLoading ? "Processando..." : <><Check size={14} className="mr-1.5" /> Confirmar Registo</>}
                    </Button>
                </div>
            </div>
        </div>
    );
}
