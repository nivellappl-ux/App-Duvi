import { useState, useMemo } from "react";
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
    Edit2
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { KPICard } from "@/components/shared/KPICard";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";

// --- Types & Data ---
interface Employee {
    id: string;
    nome: string;
    cargo: string;
    departamento: string;
    salarioBase: number;
    estado: "Ativo" | "Inativo" | "Licença";
    dataAdmissao: string;
    avatar: string;
    email: string;
    telefone: string;
    inssStatus: "Regular" | "Irregular";
    nif: string;
}

const EMPLOYEES: Employee[] = [
    { id: "1", nome: "João Silva", cargo: "Diretor Geral", departamento: "Direção", salarioBase: 4500000, estado: "Ativo", dataAdmissao: "15/01/2020", avatar: "JS", email: "joao.silva@duvion.ao", telefone: "+244 923 000 001", inssStatus: "Regular", nif: "004123456TA000" },
    { id: "2", nome: "Maria Santos", cargo: "Contabilista Sénior", departamento: "Financeiro", salarioBase: 1200000, estado: "Ativo", dataAdmissao: "03/03/2021", avatar: "MS", email: "maria.santos@duvion.ao", telefone: "+244 923 000 002", inssStatus: "Regular", nif: "004234567TA000" },
    { id: "3", nome: "Pedro Costa", cargo: "Técnico de TI", departamento: "Tecnologia", salarioBase: 850000, estado: "Ativo", dataAdmissao: "10/07/2021", avatar: "PC", email: "pedro.costa@duvion.ao", telefone: "+244 923 000 003", inssStatus: "Regular", nif: "004345678TA000" },
    { id: "4", nome: "Ana Mendes", cargo: "Gestora de RH", departamento: "RH", salarioBase: 1500000, estado: "Ativo", dataAdmissao: "22/05/2020", avatar: "AM", email: "ana.mendes@duvion.ao", telefone: "+244 923 000 004", inssStatus: "Regular", nif: "004456789TA000" },
    { id: "5", nome: "Carlos Fernandes", cargo: "Comercial Sénior", departamento: "Comercial", salarioBase: 650000, estado: "Ativo", dataAdmissao: "01/09/2022", avatar: "CF", email: "carlos.fernandes@duvion.ao", telefone: "+244 923 000 005", inssStatus: "Regular", nif: "004567890TA000" },
    { id: "6", nome: "Beatriz Lopes", cargo: "Gestora de Marketing", departamento: "Marketing", salarioBase: 950000, estado: "Licença", dataAdmissao: "15/11/2021", avatar: "BL", email: "beatriz.lopes@duvion.ao", telefone: "+244 923 000 006", inssStatus: "Regular", nif: "004678901TA000" },
    { id: "7", nome: "Ricardo Gomes", cargo: "Operador", departamento: "Operações", salarioBase: 450000, estado: "Ativo", dataAdmissao: "20/02/2023", avatar: "RG", email: "ricardo.gomes@duvion.ao", telefone: "+244 923 000 007", inssStatus: "Regular", nif: "004789012TA000" },
    { id: "8", nome: "Sofia Rodrigues", cargo: "Jurista Sénior", departamento: "Jurídico", salarioBase: 1800000, estado: "Ativo", dataAdmissao: "08/04/2020", avatar: "SR", email: "sofia.rodrigues@duvion.ao", telefone: "+244 923 000 008", inssStatus: "Regular", nif: "004890123TA000" },
];

const DEPARTMENTS = ["Todos", "Direção", "Financeiro", "Tecnologia", "RH", "Comercial", "Marketing", "Operações", "Jurídico"];

// --- Helper Functions ---
const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 0 }).format(v);

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

// --- Sub-components ---

function EmployeeDetailPanel({ emp, onClose }: { emp: Employee; onClose: () => void }) {
    const sal = calcSalario(emp.salarioBase);
    return (
        <div className="w-80 xl:w-96 flex-shrink-0 rounded-lg overflow-hidden border border-border bg-card animate-in slide-in-from-right-4 duration-300">
            <div className="p-5 border-b border-border">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg ring-4 ring-primary/10">
                            {emp.avatar}
                        </div>
                        <div>
                            <p className="text-foreground font-bold text-base leading-tight">{emp.nome}</p>
                            <p className="text-muted-foreground text-xs">{emp.cargo}</p>
                            <div className="mt-1">
                                <StatusBadge status={emp.estado} />
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors">
                        <ChevronRight size={18} className="rotate-180" />
                    </button>
                </div>
            </div>

            <div className="p-5 space-y-6">
                {/* Info Grid */}
                <div className="space-y-2">
                    {[
                        { label: "Departamento", value: emp.departamento },
                        { label: "NIF", value: emp.nif },
                        { label: "Email", value: emp.email },
                        { label: "Telefone", value: emp.telefone },
                        { label: "Data Admissão", value: emp.dataAdmissao },
                    ].map((f) => (
                        <div key={f.label} className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">{f.label}</span>
                            <span className="text-[13px] text-foreground font-medium text-right max-w-[60%] truncate">{f.value}</span>
                        </div>
                    ))}
                </div>

                {/* Salary Breakdown */}
                <SectionCard title="FOLHA SALARIAL — MARÇO" noPadding>
                    <div className="p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Salário Base</span>
                            <span className="text-xs font-bold">{formatCurrency(emp.salarioBase)} AOA</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">INSS Empregado (3%)</span>
                            <span className="text-xs font-bold text-destructive">-{formatCurrency(sal.inssEmp)} AOA</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">IRT Retido</span>
                            <span className="text-xs font-bold text-destructive">-{formatCurrency(sal.irt)} AOA</span>
                        </div>
                        <div className="pt-2 mt-2 border-t border-border flex justify-between items-baseline">
                            <span className="text-sm font-bold text-primary">Líquido</span>
                            <span className="text-lg font-bold text-primary">{formatCurrency(sal.liquido)} AOA</span>
                        </div>
                    </div>
                </SectionCard>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-md bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-95 transition-opacity">
                        <Download size={16} /> Gerar Recibo
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-md border border-border text-muted-foreground font-bold text-sm hover:bg-muted/30 transition-colors">
                        <Edit2 size={16} /> Editar Cadastro
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- Main Page ---

export default function Rh() {
    const [activeTab, setActiveTab] = useState<"list" | "payroll">("list");
    const [selectedDept, setSelectedDept] = useState("Todos");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const filteredEmployees = useMemo(() => {
        return EMPLOYEES.filter(emp => {
            const matchDept = selectedDept === "Todos" || emp.departamento === selectedDept;
            const matchSearch = emp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.cargo.toLowerCase().includes(searchTerm.toLowerCase());
            return matchDept && matchSearch;
        });
    }, [selectedDept, searchTerm]);

    // Totals
    const totalFolha = EMPLOYEES.reduce((s, e) => s + e.salarioBase, 0);
    const totalINSS = EMPLOYEES.reduce((s, e) => s + calcSalario(e.salarioBase).inssEmpr, 0);
    const totalIRT = EMPLOYEES.reduce((s, e) => s + calcSalario(e.salarioBase).irt, 0);

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                icon={Users}
                title="Recursos Humanos"
                subtitle="Gestão de pessoal · INSS · IRT — Março 2025"
                actions={
                    <div className="flex gap-2">
                        <button className="px-3 py-2 rounded-md border border-border text-xs font-bold text-muted-foreground hover:bg-muted/30 flex items-center gap-2">
                            <Download size={14} /> Exportar
                        </button>
                        <button className="px-4 py-2 rounded-md bg-accent text-accent-foreground text-xs font-bold hover:opacity-90 flex items-center gap-2">
                            <Plus size={16} /> Novo Funcionário
                        </button>
                    </div>
                }
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Ativos" value={String(EMPLOYEES.filter(e => e.estado === "Ativo").length)} icon={UserCheck} change="+2 este ano" trend="up" />
                <KPICard title="Folha Mensal" value={`${(totalFolha / 1000000).toFixed(1)}M AOA`} icon={DollarSign} change="+3.2%" trend="up" accent />
                <KPICard title="INSS Total" value={`${(totalINSS / 1000000).toFixed(2)}M AOA`} icon={Shield} subtitle="Vence dia 10/04" />
                <KPICard title="IRT Total" value={`${(totalIRT / 1000000).toFixed(2)}M AOA`} icon={TrendingDown} subtitle="Vence dia 10/04" />
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-border">
                {[
                    { id: "list", label: "Funcionários" },
                    { id: "payroll", label: "Processamento Salarial" }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                        )}
                    </button>
                ))}
            </div>

            {activeTab === "list" ? (
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                        {/* Filters */}
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="relative flex-1 min-w-[240px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <input
                                    type="text"
                                    placeholder="Pesquisar funcionário..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            <div className="flex gap-2 p-1 rounded-lg bg-muted/20 border border-border">
                                <button className="p-2 rounded-md hover:bg-muted/50 text-muted-foreground transition-all">
                                    <Filter size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Department Chips */}
                        <div className="flex flex-wrap gap-2">
                            {DEPARTMENTS.map(dept => (
                                <button
                                    key={dept}
                                    onClick={() => setSelectedDept(dept)}
                                    className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all border ${selectedDept === dept
                                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                            : "bg-card border-border text-muted-foreground hover:border-primary/30"
                                        }`}
                                >
                                    {dept}
                                </button>
                            ))}
                        </div>

                        {/* Table */}
                        <div className="rounded-lg overflow-hidden border border-border bg-card">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-primary bg-muted/10">
                                            <th className="text-left py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-wider">Funcionário</th>
                                            <th className="text-left py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-wider">Cargo</th>
                                            <th className="text-right py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-wider">Salário Base</th>
                                            <th className="text-center py-4 px-4 text-[10px] font-bold text-primary uppercase tracking-wider">Estado</th>
                                            <th className="py-4 px-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {filteredEmployees.map((emp, i) => (
                                            <tr
                                                key={emp.id}
                                                onClick={() => setSelectedEmployee(selectedEmployee?.id === emp.id ? null : emp)}
                                                className={`group cursor-pointer transition-colors ${selectedEmployee?.id === emp.id ? "bg-primary/5" : (i % 2 === 0 ? "bg-transparent" : "bg-muted/5")
                                                    } hover:bg-primary/10`}
                                            >
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] transition-all ${selectedEmployee?.id === emp.id ? "bg-primary text-white" : "bg-primary/15 text-primary"
                                                            }`}>
                                                            {emp.avatar}
                                                        </div>
                                                        <span className="text-[13px] font-bold text-foreground">{emp.nome}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="text-[12px] text-muted-foreground font-medium">{emp.cargo}</span>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <span className="text-[13px] font-bold">{formatCurrency(emp.salarioBase)}</span>
                                                    <span className="text-[10px] text-muted-foreground ml-1 font-bold">AOA</span>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <StatusBadge status={emp.estado} />
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <ChevronRight
                                                        size={14}
                                                        className={`transition-all ${selectedEmployee?.id === emp.id ? "text-primary translate-x-1" : "text-muted-foreground/30"}`}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Side Panel */}
                    {selectedEmployee && (
                        <EmployeeDetailPanel
                            emp={selectedEmployee}
                            onClose={() => setSelectedEmployee(null)}
                        />
                    )}
                </div>
            ) : (
                <section className="animate-in fade-in duration-500">
                    <SectionCard
                        title="Folha de Pagamento Consolidada"
                        subtitle="Valores processados com base nas tabelas de IRT e INSS vigentes."
                        noPadding
                        actions={
                            <button className="px-3 py-1.5 rounded bg-primary text-white text-[11px] font-bold hover:opacity-90">
                                <Download size={12} className="inline mr-1" /> PDF Completo
                            </button>
                        }
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-primary bg-muted/5">
                                        <th className="text-left p-4 text-[10px] font-bold text-primary uppercase">Funcionário</th>
                                        <th className="text-right p-4 text-[10px] font-bold text-primary uppercase">Salário Base</th>
                                        <th className="text-right p-4 text-[10px] font-bold text-primary uppercase text-destructive">INSS (3%)</th>
                                        <th className="text-right p-4 text-[10px] font-bold text-primary uppercase text-destructive">IRT</th>
                                        <th className="text-right p-4 text-[10px] font-bold text-primary uppercase text-success">Líquido</th>
                                        <th className="text-right p-4 text-[10px] font-bold text-primary uppercase">Custo Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {EMPLOYEES.map((emp, i) => {
                                        const sal = calcSalario(emp.salarioBase);
                                        return (
                                            <tr key={emp.id} className={i % 2 === 0 ? "bg-transparent" : "bg-muted/5"}>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] font-bold">
                                                            {emp.avatar}
                                                        </div>
                                                        <span className="text-[12px] font-bold">{emp.nome}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right text-[12px] font-bold">{formatCurrency(emp.salarioBase)}</td>
                                                <td className="p-4 text-right text-[12px] font-bold text-destructive">-{formatCurrency(sal.inssEmp)}</td>
                                                <td className="p-4 text-right text-[12px] font-bold text-destructive">-{formatCurrency(sal.irt)}</td>
                                                <td className="p-4 text-right text-[12px] font-bold text-success">{formatCurrency(sal.liquido)}</td>
                                                <td className="p-4 text-right text-[12px] font-bold text-primary">{formatCurrency(sal.custoTotal)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="bg-muted/20 border-t-2 border-primary">
                                    <tr>
                                        <td className="p-4 text-[11px] font-bold uppercase">Totais</td>
                                        <td className="p-4 text-right text-[13px] font-bold">{formatCurrency(totalFolha)}</td>
                                        <td className="p-4 text-right text-[13px] font-bold text-destructive">-{formatCurrency(EMPLOYEES.reduce((s, e) => s + calcSalario(e.salarioBase).inssEmp, 0))}</td>
                                        <td className="p-4 text-right text-[13px] font-bold text-destructive">-{formatCurrency(totalIRT)}</td>
                                        <td className="p-4 text-right text-[14px] font-bold text-success">{formatCurrency(EMPLOYEES.reduce((s, e) => s + calcSalario(e.salarioBase).liquido, 0))}</td>
                                        <td className="p-4 text-right text-[14px] font-bold text-primary">{formatCurrency(totalFolha + EMPLOYEES.reduce((s, e) => s + calcSalario(e.salarioBase).inssEmpr, 0))}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </SectionCard>
                </section>
            )}
        </div>
    );
}
