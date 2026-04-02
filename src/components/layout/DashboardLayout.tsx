import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    // Map path to page name
    const getPageName = () => {
        const path = location.pathname;
        if (path === "/" || path === "/dashboard") return "Dashboard";
        if (path.includes("rh")) return "Recursos Humanos";
        if (path.includes("financeiro")) return "Financeiro";
        if (path.includes("tesouraria")) return "Tesouraria";
        if (path.includes("faturacao")) return "Faturação";
        if (path.includes("fiscalidade")) return "Fiscalidade";
        if (path.includes("plafond")) return "Plafond";
        if (path.includes("conta-bancaria")) return "Conta Bancária";
        if (path.includes("configuracoes")) return "Configurações";
        return "ERP";
    };

    return (
        <div className="min-h-screen flex text-foreground" style={{ backgroundColor: "var(--background)" }}>
            {/* Sidebar Overlay (Mobile) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Column */}
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar
                    currentPage={getPageName()}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="flex-1 overflow-auto custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
