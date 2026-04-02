import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import {
    FileText,
    LayoutDashboard,
    Receipt,
    Users,
    Wallet,
    Settings,
    Search,
    PlusCircle
} from "lucide-react";

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            // Abre Command Palette com CTRL+K
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }

            // Atalho Rápido para N -> Nova Fatura (Apenas se modal estiver fechado e não em input)
            if (e.key.toLowerCase() === "n" && !open && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
                // Poderia abrir um drawer de nova fatura aqui
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [open]);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 hover:bg-muted/80 border border-border px-3 py-1.5 rounded-md transition-colors w-64"
            >
                <Search className="h-4 w-4" />
                <span>Pesquisar...</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Pesquise por clientes, faturas, módulos..." />
                <CommandList>
                    <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

                    <CommandGroup heading="Módulos Principais">
                        <CommandItem onSelect={() => runCommand(() => navigate("/dashboard"))}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                            <CommandShortcut>D</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/faturacao"))}>
                            <Receipt className="mr-2 h-4 w-4" />
                            <span>Faturação</span>
                            <CommandShortcut>F</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/clientes"))}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>Gestão de Clientes</span>
                            <CommandShortcut>C</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/financeiro"))}>
                            <Wallet className="mr-2 h-4 w-4" />
                            <span>Financeiro</span>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    <CommandGroup heading="Ações Rápidas">
                        <CommandItem onSelect={() => runCommand(() => navigate("/faturacao?action=new"))}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            <span>Emitir Nova Fatura</span>
                            <CommandShortcut>N</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/relatorios"))}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Gerar Relatório Excel/PDF</span>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    <CommandGroup heading="Sistema">
                        <CommandItem onSelect={() => runCommand(() => navigate("/configuracoes"))}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Configurações Estáticas</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/utilizadores"))}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>Gestão de Utilizadores</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
