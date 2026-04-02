import { useState } from "react";
import {
    Menu,
    ChevronRight,
    Bell,
    Sun,
    Moon,
    AlertTriangle
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
    currentPage: string;
    onMenuClick: () => void;
}

const alerts = [
    { id: "a1", type: "warning", text: "IVA vence em 15/04 — 6.58M AOA" },
    { id: "a2", type: "danger", text: "INSS vence em 10/04 — 1.9M AOA" },
    { id: "a3", type: "info", text: "2 faturas vencidas aguardam pagamento" },
];

export function Navbar({ currentPage, onMenuClick }: NavbarProps) {
    const { isDark, toggleTheme } = useTheme();
    const { user } = useAuth();
    const [notifOpen, setNotifOpen] = useState(false);

    return (
        <header
            className="h-14 flex items-center justify-between px-4 md:px-6 border-b flex-shrink-0 z-30"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground"
                >
                    <Menu size={20} />
                </button>

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[13px] text-muted-foreground font-medium">Duvion</span>
                    <ChevronRight size={14} className="text-muted-foreground/50 shrink-0" />
                    <span className="text-[13px] text-foreground font-bold truncate">
                        {currentPage}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {/* BNA Rate Widget */}
                <div
                    className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border bg-muted/20"
                    style={{ borderColor: "var(--border)" }}
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[11px] text-muted-foreground font-bold">BNA</span>
                    <span className="text-[11px] text-primary font-bold">
                        1 USD = 850 AOA
                    </span>
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-primary transition-all"
                    title={isDark ? "Modo Claro" : "Modo Escuro"}
                >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        className={`p-2 rounded-md hover:bg-muted/50 transition-all relative ${notifOpen ? 'bg-muted text-primary' : 'text-foreground'}`}
                    >
                        <Bell size={18} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary border-2 border-background" />
                    </button>

                    {notifOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                            <div
                                className="absolute right-0 mt-2 w-80 rounded-lg z-20 shadow-2xl overflow-hidden border animate-in slide-in-from-top-2 duration-200"
                                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                            >
                                <div className="px-4 py-3 border-b flex items-center justify-between bg-card" style={{ borderColor: "var(--border)" }}>
                                    <div className="flex items-center gap-2">
                                        <Bell size={14} className="text-primary" />
                                        <span className="text-[13px] font-bold">Alertas do Sistema</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                                        3 NOVOS
                                    </span>
                                </div>
                                <div className="divide-y divide-border">
                                    {alerts.map((alert) => (
                                        <div key={alert.id} className="px-4 py-3 flex items-start gap-3 hover:bg-muted/20 transition-colors cursor-pointer">
                                            <AlertTriangle size={14} className={alert.type === 'danger' ? 'text-destructive' : 'text-warning'} style={{ marginTop: "2px" }} />
                                            <p className="text-[12px] leading-relaxed text-foreground font-medium">{alert.text}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-4 py-2 bg-card/50 text-center">
                                    <button className="text-[11px] font-bold text-primary hover:underline">
                                        Ver todos os alertas
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-2 pl-2 border-l border-border h-6">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-white font-bold text-[11px] shrink-0">
                        {user?.avatar}
                    </div>
                </div>
            </div>
        </header>
    );
}
