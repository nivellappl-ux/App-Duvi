import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Printer } from "lucide-react";
import { formatCurrencyAOA } from "@/lib/format";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type InvoiceItem = {
    id: string;
    description: string;
    quantity: number;
    price: number;
    tax: number; // IVA percentage, e.g., 14 or 0
};

export const InvoiceForm = ({ onClose }: { onClose: () => void }) => {
    const [clientName, setClientName] = useState("");
    const [clientNif, setClientNif] = useState("");
    const [items, setItems] = useState<InvoiceItem[]>([
        { id: "1", description: "", quantity: 1, price: 0, tax: 14 }
    ]);

    const addItem = () => {
        setItems([
            ...items,
            { id: Date.now().toString(), description: "", quantity: 1, price: 0, tax: 14 }
        ]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter((item) => item.id !== id));
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
        setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    };

    const subTotal = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const totalTax = items.reduce((acc, item) => acc + (item.quantity * item.price * (item.tax / 100)), 0);
    const total = subTotal + totalTax;

    const generatePDF = () => {
        if (!clientName || !clientNif) {
            toast.error("Preencha os dados do cliente.");
            return;
        }

        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text("FATURA", 14, 22);

        doc.setFontSize(10);
        doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Cliente: ${clientName}`, 14, 36);
        doc.text(`NIF: ${clientNif}`, 14, 42);

        const tableData = items.map(item => [
            item.description || "Item sem descrição",
            item.quantity.toString(),
            formatCurrencyAOA(item.price),
            `${item.tax}%`,
            formatCurrencyAOA(item.quantity * item.price * (1 + item.tax / 100))
        ]);

        autoTable(doc, {
            startY: 50,
            head: [["Descrição", "Qtd", "Preço Unitário", "IVA", "Total"]],
            body: tableData,
        });

        const finalY = (doc as any).lastAutoTable.finalY || 50;
        doc.text(`Subtotal: ${formatCurrencyAOA(subTotal)}`, 140, finalY + 10);
        doc.text(`IVA Total: ${formatCurrencyAOA(totalTax)}`, 140, finalY + 16);
        doc.setFontSize(12);
        doc.text(`TOTAL A PAGAR: ${formatCurrencyAOA(total)}`, 140, finalY + 24);

        doc.save(`Fatura_${clientName}_${Date.now()}.pdf`);
        toast.success("Fatura emitida e PDF gerado com sucesso!");
        onClose();
    };

    return (
        <div className="flex flex-col h-full space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="cliente">Nome do Cliente</Label>
                    <Input
                        id="cliente"
                        placeholder="Ex: Empresa Lda"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nif">NIF</Label>
                    <Input
                        id="nif"
                        placeholder="Ex: 5000000000"
                        value={clientNif}
                        onChange={(e) => setClientNif(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Itens da Fatura</h3>
                    <Button variant="outline" size="sm" onClick={addItem}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar linha
                    </Button>
                </div>

                {items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-muted/40 p-2 rounded-md">
                        <div className="col-span-4">
                            <Input
                                placeholder="Descrição"
                                value={item.description}
                                onChange={(e) => updateItem(item.id, "description", e.target.value)}
                            />
                        </div>
                        <div className="col-span-2">
                            <Input
                                type="number"
                                min="1"
                                placeholder="Qtd"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                            />
                        </div>
                        <div className="col-span-3">
                            <Input
                                type="number"
                                placeholder="Preço (AOA)"
                                value={item.price}
                                onChange={(e) => updateItem(item.id, "price", Number(e.target.value))}
                            />
                        </div>
                        <div className="col-span-2">
                            <Input
                                type="number"
                                placeholder="IVA %"
                                value={item.tax}
                                onChange={(e) => updateItem(item.id, "tax", Number(e.target.value))}
                            />
                        </div>
                        <div className="col-span-1 flex justify-end">
                            <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removeItem(item.id)} disabled={items.length === 1}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                <div className="mt-6 flex flex-col items-end space-y-2 text-sm border-t pt-4">
                    <div className="flex justify-between w-48 text-muted-foreground">
                        <span>Subtotal:</span>
                        <span>{formatCurrencyAOA(subTotal)}</span>
                    </div>
                    <div className="flex justify-between w-48 text-muted-foreground">
                        <span>IVA:</span>
                        <span>{formatCurrencyAOA(totalTax)}</span>
                    </div>
                    <div className="flex justify-between w-48 font-bold text-base pt-2 border-t">
                        <span>Total:</span>
                        <span>{formatCurrencyAOA(total)}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-2 border-t pt-4">
                <Button variant="outline" onClick={onClose}>Cancelar</Button>
                <Button onClick={generatePDF} className="bg-primary hover:bg-primary/90">
                    <Printer className="mr-2 h-4 w-4" />
                    Gerar PDF
                </Button>
            </div>
        </div>
    );
};
