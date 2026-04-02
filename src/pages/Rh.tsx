import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Users,
    Search,
    Plus,
    Download,
    Filter,
    UserCheck,
    DollarSign,
    Shield,
    TrendingDown,
    ChevronRight,
    Edit2,
    PlusCircle,
    ArrowUpRight,
    Building2,
    Phone,
    Mail,
    UserPlus,
    Briefcase,
    Calendar
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { motion } from "framer-motion";
import { toast } from "sonner";
import CountUp from "react-countup";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { Button } from "@/components/ui/button";

// --- Helper Functions (Angolan Tax Logic) ---
const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA", minimumFractionDigits: 0 }).format(v);

function calcIRT(salarioBruto: number): number {
    const escaloes = [
        { min: 0, max: 34450, taxa: 0, parcela: 0 },
        { min: 34451, max: 35000, taxa: 0.10, parcela: 3445 },
        { min: 35001, max: 40000, taxa: 0.13, parcela: 4496 },
        { min: 40001, max: 45000, taxa: 0.16, parcela: 5696 },
        { min: 45001, max: 50000, taxa: 0.18, parcela: 6596 },
        { min: 50001, max: 70000, taxa: 0.19, parcela: 7096 },
        { min: 70001, max: Infinity, taxa: 0.25, parcela: 11296 },
    ];
    for (const e of escaloes) {
        if (salarioBruto <= e.max) {
            return Math.max(0, salarioBruto * e.taxa - e.parcela);
        }
    }
    return 0;
}

function calcSalario(salarioBase: number) {
    const inssEmp = Math.round(salarioBase * 0.03);
    const irt = Math.round(calcIRT(salarioBase));
    const liquido = salarioBase - inssEmp - irt;
    const inssEmpr = Math.round(salarioBase * 0.08);
    return { inssEmp, inssEmpr, irt, liquido, custoTotal: salarioBase + inssEmpr };
}

export default function Rh() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"list" | "payroll">("list");
    const [selectedDept, setSelectedDept] = useState("Todos");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [empRes, deptRes] = await Promise.all([
                supabase.from("employees").select("*, departments(name)").order("first_name"),
                supabase.from("departments").select("*")
            ]);

            if (empRes.error) throw empRes.error;
            if (deptRes.error) throw deptRes.error;

            setEmployees(empRes.data || []);
            setDepartments(deptRes.data || []);
        } catch (error: any) {
            toast.error("Erro ao carregar dados de RH: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = useMemo(() => {
        const totalFolha = employees.reduce((s, e) => s + (Number(e.salary) || 0), 0);
        const totalINSS = employees.reduce((s, e) => s + calcSalario(Number(e.salary) || 0).inssEmpr, 0);
        const totalIRT = employees.reduce((s, e) => s + calcSalario(Number(e.salary) || 0).irt, 0);
        const ativos = employees.filter(e => e.status === "Ativo").length;
        return { totalFolha, totalINSS, totalIRT, ativos };
    }, [employees]);

    const filtered = useMemo(() => {
        return employees.filter(emp => {
            const name = `${emp.first_name} ${emp.last_name}`.toLowerCase();
            const matchDept = selectedDept === "Todos" || emp.departments?.name === selectedDept;
            const matchSearch = name.includes(searchTerm.toLowerCase()) ||
                emp.position?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchDept && matchSearch;
        });
    }, [employees, selectedDept, searchTerm]);

    const columns = [
        {
            key: "first_name",
            label: "Funcionário",
            render: (_: any, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px]">
                        {row.first_name[0]}{row.last_name[0]}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-foreground">{row.first_name} {row.last_name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{row.departments?.name || 'Geral'}</span>
                    </div>
                </div>
            )
        },
        { key: "position", label: "Cargo", render: (val: string) => <span className="text-xs font-medium text-muted-foreground">{val}</span> },
        {
            key: "salary",
            label: "Salário Base",
            render: (val: number) => <span className="font-bold">{formatCurrency(val)}</span>
        },
        {
            key: "status",
            label: "Estado",
            render: (val: any) => (
                <StatusBadge
                    label={val}
                    tone={val === "Ativo" ? "success" : val === "Licença" ? "warning" : "neutral"}
                />
            )
        },
        {
            key: "ações",
            label: "",
            render: () => (
                <PermissionGate permission="hr.manage">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit2 size={14} className="text-muted-foreground" />
                    </Button>
                </PermissionGate>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Recursos Humanos"
                description="Gestão de colaboradores, processamento de salários e obrigações fiscais"
                action={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs font-bold">
                            <Briefcase size={14} className="mr-2" /> Estrutura
                        </Button>
                        <PermissionGate permission="hr.manage">
                            <Button className="bg-primary text-white shadow-lg shadow-primary/20 text-xs font-bold">
                                <PlusCircle size={14} className="mr-2" /> Admitir Colaborador
                            </Button>
                        </PermissionGate>
                    </div>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <UserCheck className="text-success" size={16} />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ativos</span>
                        </div>
                        <h3 className="text-2xl font-bold"><CountUp end={stats.ativos} duration={1} /></h3>
                    </CardContent>
                </Card>
                <Card className="bg-card shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign className="text-primary" size={16} />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Folha Mensal</span>
                        </div>
                        <h3 className="text-2xl font-bold">{formatCurrency(stats.totalFolha)}</h3>
                    </CardContent>
                </Card>
                <Card className="bg-card shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Shield className="text-warning" size={16} />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">INSS Previsto</span>
                        </div>
                        <h3 className="text-2xl font-bold text-warning">{formatCurrency(stats.totalINSS)}</h3>
                    </CardContent>
                </Card>
                <Card className="bg-card shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingDown className="text-destructive" size={16} />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">IRT Estimado</span>
                        </div>
                        <h3 className="text-2xl font-bold text-destructive">{formatCurrency(stats.totalIRT)}</h3>
                    </CardContent>
                </Card>
            </div>

            <div className="flex border-b border-border">
                {[{ id: "list", label: "Funcionários" }, { id: "payroll", label: "Processamento" }].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all relative ${activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(37,99,235,0.5)]" />}
                    </button>
                ))}
            </div>

            {activeTab === "list" ? (
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedDept("Todos")}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all border ${selectedDept === "Todos" ? "bg-primary border-primary text-white shadow-lg shadow-primary/10" : "bg-card border-border text-muted-foreground hover:border-primary/30"
                                    }`}
                            >
                                TODOS
                            </button>
                            {departments.map(dept => (
                                <button
                                    key={dept.id}
                                    onClick={() => setSelectedDept(dept.name)}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all border ${selectedDept === dept.name ? "bg-primary border-primary text-white shadow-lg shadow-primary/10" : "bg-card border-border text-muted-foreground hover:border-primary/30"
                                        }`}
                                >
                                    {dept.name.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                            <input
                                placeholder="Pesquisar funcionário..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 h-9 border border-border rounded-lg bg-card text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                    </div>

                    <Card className="border-border shadow-md overflow-hidden">
                        <CardContent className="p-0">
                            <DataTable
                                columns={columns as any}
                                rows={filtered}
                                isLoading={isLoading}
                            />
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <Card className="border-border shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <CardHeader className="bg-muted/30 border-b p-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground italic">Cálculo de IRT & INSS Atualizado</CardTitle>
                        <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold">
                            <Download size={12} className="mr-1.5" /> PDF
                        </Button>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-[11px]">
                            <thead>
                                <tr className="border-b border-primary bg-primary/5">
                                    <th className="text-left p-4 uppercase font-bold text-primary">Funcionário</th>
                                    <th className="text-right p-4 uppercase font-bold text-primary">Base</th>
                                    <th className="text-right p-4 uppercase font-bold text-destructive">INSS (3%)</th>
                                    <th className="text-right p-4 uppercase font-bold text-destructive">IRT</th>
                                    <th className="text-right p-4 uppercase font-bold text-success">Líquido</th>
                                    <th className="text-right p-4 uppercase font-bold text-primary">Custo Co. (8%)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {filtered.map((emp, i) => {
                                    const sal = calcSalario(Number(emp.salary) || 0);
                                    return (
                                        <tr key={emp.id} className={i % 2 === 0 ? "bg-transparent" : "bg-muted/5 hover:bg-primary/5 transition-colors"}>
                                            <td className="p-4 font-bold">{emp.first_name} {emp.last_name}</td>
                                            <td className="p-4 text-right font-medium">{formatCurrency(Number(emp.salary) || 0)}</td>
                                            <td className="p-4 text-right text-destructive font-medium">-{formatCurrency(sal.inssEmp)}</td>
                                            <td className="p-4 text-right text-destructive font-medium">-{formatCurrency(sal.irt)}</td>
                                            <td className="p-4 text-right text-success font-bold">{formatCurrency(sal.liquido)}</td>
                                            <td className="p-4 text-right font-medium">{formatCurrency(sal.custoTotal)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}
