import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    TrendingUp,
    BookOpen,
    FileText,
    Users,
    Shield,
    Building2,
    Layers,
    Settings,
    LogOut,
    X,
    ChevronRight,
    Wallet,
    Moon,
    Sun,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import duvionLogo from "@/assets/f74fa39df10f3fd556b81d464aeb8628aaf5cd57.png";

interface MenuItem {
    icon: React.ElementType;
    label: string;
    path: string;
    group?: string;
}

const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/", group: "principal" },
    { icon: TrendingUp, label: "Financeiro", path: "/financeiro", group: "financas" },
    { icon: BookOpen, label: "Diário de Caixa", path: "/diario-caixa", group: "financas" },
    { icon: Wallet, label: "Tesouraria", path: "/tesouraria", group: "financas" },
    { icon: Building2, label: "Conta Bancária", path: "/contas", group: "financas" },
    { icon: FileText, label: "Faturação", path: "/faturacao", group: "comercial" },
    { icon: Users, label: "Recursos Humanos", path: "/rh", group: "operacoes" },
    { icon: Layers, label: "Plafond", path: "/plafond", group: "operacoes" },
    { icon: Shield, label: "Fiscalidade", path: "/fiscalidade", group: "fiscal" },
    { icon: Settings, label: "Configurações", path: "/configuracoes", group: "sistema" },
];

const groupLabels: Record<string, string> = {
    principal: "Principal",
    financas: "Finanças",
    comercial: "Comercial",
    operacoes: "Operações",
    fiscal: "Fiscal",
    sistema: "Sistema",
};

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark, setDark, setLight } = useTheme();
    const { user, logout } = useAuth();

    const isActive = (path: string) => {
        if (path === "/") return location.pathname === "/";
        return location.pathname.startsWith(path);
    };

    const groupedItems = menuItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
        const g = item.group || "other";
        if (!acc[g]) acc[g] = [];
        acc[g].push(item);
        return acc;
    }, {});

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div
            className={`flex flex-col h-full z-50 transition-all duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
            style={{ backgroundColor: "var(--card)", width: "240px", borderRight: "1px solid var(--border)" }}
        >
            {/* Logo */}
            <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-3">
                    <img src={duvionLogo} alt="Duvion Logo" className="w-10 h-10" />
                    <div>
                        <h2 className="text-[22px] font-bold tracking-tight text-primary">Duvion</h2>
                        <p className="text-[10px] font-bold tracking-[2px] text-muted-foreground -mt-1 uppercase">ERP ANGOLA</p>
                    </div>
                </div>
                <button onClick={onClose} className="lg:hidden p-1 text-muted-foreground hover:text-foreground transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
                {Object.entries(groupedItems).map(([group, items]) => (
                    <div key={group} className="mb-6">
                        <p className="px-3 mb-2 text-[10px] font-bold tracking-[1.5px] text-muted-foreground uppercase">
                            {groupLabels[group]}
                        </p>
                        {items.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => { navigate(item.path); onClose(); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md mb-0.5 transition-all relative group ${active ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-card-hover hover:text-foreground"
                                        }`}
                                >
                                    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-r" />}
                                    <Icon size={16} className={active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"} />
                                    <span className="text-[13px]">{item.label}</span>
                                    {active && <ChevronRight size={12} className="ml-auto" />}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Theme Toggle */}
            <div className="px-4 pb-2">
                <div className="flex items-center rounded-lg p-1 gap-1 border bg-muted/30">
                    <button
                        onClick={setDark}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all text-xs font-bold ${isDark ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Moon size={13} /> Escuro
                    </button>
                    <button
                        onClick={setLight}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all text-xs font-bold ${!isDark ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Sun size={13} /> Claro
                    </button>
                </div>
            </div>

            {/* Profile */}
            <div className="border-t p-4" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-3 p-3 rounded-lg mb-2 bg-muted/30">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-primary text-white font-bold text-xs ring-2 ring-primary/20">
                        {user?.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-foreground truncate">{user?.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all font-medium text-[13px]"
                >
                    <LogOut size={16} /> Terminar Sessão
                </button>
            </div>
        </div>
    );
}
