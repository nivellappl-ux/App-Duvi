import { useState } from "react";
import { Settings, Building, Users, Globe, Shield, Bell, Database, Save, Plus, Trash2, Check, Info, AlertOctagon, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

// --- Types ---
type Tab = "empresa" | "utilizadores" | "fiscal" | "notificacoes" | "sistema";

interface User {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  estado: "Ativo" | "Inativo";
  avatar: string;
}

const users: User[] = [
  { id: "1", nome: "João Silva", email: "joao.silva@duvion.ao", perfil: "Administrador", estado: "Ativo", avatar: "JS" },
  { id: "2", nome: "Maria Santos", email: "maria.santos@duvion.ao", perfil: "Contabilista", estado: "Ativo", avatar: "MS" },
  { id: "3", nome: "Pedro Costa", email: "pedro.costa@duvion.ao", perfil: "Técnico TI", estado: "Ativo", avatar: "PC" },
  { id: "4", nome: "Ana Mendes", email: "ana.mendes@duvion.ao", perfil: "RH Manager", estado: "Inativo", avatar: "AM" },
];

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "empresa", label: "Perfil Empresa", icon: Building },
  { key: "utilizadores", label: "Controle de Acessos", icon: Users },
  { key: "fiscal", label: "Regras Fiscais", icon: Shield },
  { key: "notificacoes", label: "Alertas & Notificações", icon: Bell },
  { key: "sistema", label: "Dados do Sistema", icon: Database },
];

// --- Components ---
const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  readOnly = false,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  readOnly?: boolean;
  placeholder?: string;
}) => (
  <div className="space-y-1.5 group">
    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block px-1 group-focus-within:text-primary transition-colors">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border-2 transition-all text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 ${readOnly
            ? "bg-muted/10 border-border/50 text-muted-foreground cursor-not-allowed"
            : "bg-card border-border hover:border-primary/50 text-foreground focus:border-primary"
          }`}
      />
      {readOnly && <Shield size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" />}
    </div>
  </div>
);

const ToggleSetting = ({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card group hover:border-primary/30 transition-all">
    <div className="space-y-1">
      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{label}</p>
      {description && <p className="text-[11px] font-medium text-muted-foreground">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-14 h-8 rounded-full transition-all flex items-center shadow-inner ${enabled ? "bg-primary" : "bg-muted shadow-muted-foreground/10"
        }`}
    >
      <div
        className={`absolute w-6 h-6 rounded-full bg-white shadow-xl transition-all ${enabled ? "left-7 translate-x-0" : "left-1 translate-x-0"
          }`}
      />
    </button>
  </div>
);

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState<Tab>("empresa");
  const [saved, setSaved] = useState(false);
  const [empresa, setEmpresa] = useState({
    nome: "Duvion Lda",
    nif: "5417123456",
    telefone: "+244 222 123 456",
    email: "geral@duvion.ao",
    endereco: "Rua Rainha Ginga, 123, Luanda",
    provincia: "Luanda",
    pais: "Angola",
    website: "www.duvion.ao",
    capital: "50.000.000 AOA",
    actividade: "Consultoria e Tecnologia",
  });
  const [fiscalConfig, setFiscalConfig] = useState({
    taxaIVA: "14",
    serieFatura: "FT",
    proximoNumero: "246",
    inssEmpregado: "3",
    inssEmpregador: "8",
    taxaBNA: "850",
    regimeIVA: "Regime Geral",
  });
  const [notifs, setNotifs] = useState({
    fatVencidas: true,
    pagamentosProximos: true,
    inssVencimento: true,
    ivaVencimento: true,
    plafondAlerta: true,
    relatorioMensal: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        icon={Settings}
        title="Governação Corporativa"
        subtitle="Administração de perfil, permissões e diretrizes fiscais do sistema."
        actions={
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-black text-xs transition-all shadow-lg active:scale-95 ${saved
                ? "bg-success text-white shadow-success/20"
                : "bg-primary text-white shadow-primary/20 hover:scale-[1.02]"
              }`}
          >
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? "GUARDADO COM SUCESSO!" : "GUARDAR CONFIGURAÇÕES"}
          </button>
        }
      />

      <div className="flex gap-8">
        {/* Navigation Sidebar */}
        <div className="w-64 flex-shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${isActive
                    ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]"
                    : "text-muted-foreground hover:bg-card-hover hover:text-foreground"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-white/20' : 'bg-muted/10 group-hover:bg-primary/10'}`}>
                    <Icon size={18} />
                  </div>
                  <span className="text-[12px] font-black uppercase tracking-wider">{tab.label}</span>
                </div>
                {isActive && <ChevronRight size={16} className="animate-in slide-in-from-left-2" />}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-card border border-border rounded-2xl p-8 shadow-sm">
          {/* Empresa Tab */}
          {activeTab === "empresa" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 border-b border-border pb-6">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Building size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">Identidade Corporativa</h3>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Informações legais e operacionais da entidade.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Denominação Social" value={empresa.nome} onChange={(v) => setEmpresa({ ...empresa, nome: v })} />
                <InputField label="NIF (Registo Fiscal)" value={empresa.nif} onChange={(v) => setEmpresa({ ...empresa, nif: v })} />
                <InputField label="Linha de Contacto" value={empresa.telefone} onChange={(v) => setEmpresa({ ...empresa, telefone: v })} />
                <InputField label="Endereço de Correio" type="email" value={empresa.email} onChange={(v) => setEmpresa({ ...empresa, email: v })} />
                <div className="md:col-span-2">
                  <InputField label="Sede Fiscal / Morada Principal" value={empresa.endereco} onChange={(v) => setEmpresa({ ...empresa, endereco: v })} />
                </div>
                <InputField label="Província / Hub" value={empresa.provincia} onChange={(v) => setEmpresa({ ...empresa, provincia: v })} />
                <InputField label="Estado / País" value={empresa.pais} readOnly />
                <InputField label="Presença Digital (Web)" value={empresa.website} onChange={(v) => setEmpresa({ ...empresa, website: v })} />
                <InputField label="Capital Social Declarado" value={empresa.capital} onChange={(v) => setEmpresa({ ...empresa, capital: v })} />
                <div className="md:col-span-2">
                  <InputField label="Domínio de Actividade" value={empresa.actividade} onChange={(v) => setEmpresa({ ...empresa, actividade: v })} />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-primary/5 border-2 border-primary/10 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary text-white"><Info size={18} /></div>
                <p className="text-[12px] font-medium text-muted-foreground leading-relaxed">
                  <strong className="text-primary font-black uppercase">REQUISITO LEGAL AGT:</strong> Os dados acima são utilizados para a selagem digital de faturas (SAFT-AO) e comunicações oficiais com a Administração Geral Tributária. Certifique-se da exactidão do NIF.
                </p>
              </div>
            </div>
          )}

          {/* Utilizadores Tab */}
          {activeTab === "utilizadores" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between border-b border-border pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground tracking-tight">Utilizadores & Privilégios</h3>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Gestão de acessos e perfis operacionais de utilizadores.</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-black text-[10px] tracking-widest shadow-lg shadow-primary/20 uppercase">
                  <Plus size={16} /> ADICIONAR OPERADOR
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-5 rounded-xl border border-border bg-card group hover:border-primary/40 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-black text-sm border-2 border-primary/30 group-hover:bg-primary group-hover:text-white transition-all">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{user.nome}</p>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest ring-1 ring-primary/20">
                          {user.perfil}
                        </span>
                        <p className={`text-[10px] font-black uppercase tracking-tighter mt-1.5 ${user.estado === 'Ativo' ? 'text-success' : 'text-muted-foreground'}`}>
                          ● {user.estado}
                        </p>
                      </div>
                      <button className="p-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fiscal Tab */}
          {activeTab === "fiscal" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 border-b border-border pb-6">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">Parametrização Fiscal</h3>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Configuração de impostos e parâmetros de facturação AGT.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Taxa Padrão de IVA (%)" value={fiscalConfig.taxaIVA} onChange={(v) => setFiscalConfig({ ...fiscalConfig, taxaIVA: v })} type="number" />
                <InputField label="Modelo de Enquadramento IVA" value={fiscalConfig.regimeIVA} onChange={(v) => setFiscalConfig({ ...fiscalConfig, regimeIVA: v })} />
                <InputField label="Serializador de Documentos (Prefix)" value={fiscalConfig.serieFatura} onChange={(v) => setFiscalConfig({ ...fiscalConfig, serieFatura: v })} />
                <InputField label="Numerador Sequencial Próximo" value={fiscalConfig.proximoNumero} onChange={(v) => setFiscalConfig({ ...fiscalConfig, proximoNumero: v })} />
                <InputField label="Quota-parte INSS Funcionário (%)" value={fiscalConfig.inssEmpregado} onChange={(v) => setFiscalConfig({ ...fiscalConfig, inssEmpregado: v })} type="number" />
                <InputField label="Quota-parte INSS Entidade (%)" value={fiscalConfig.inssEmpregador} onChange={(v) => setFiscalConfig({ ...fiscalConfig, inssEmpregador: v })} type="number" />
                <div className="md:col-span-2">
                  <InputField label="Taxa Predefinida BNA (USD Reference)" value={fiscalConfig.taxaBNA} onChange={(v) => setFiscalConfig({ ...fiscalConfig, taxaBNA: v })} type="number" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-muted/10 border border-border flex items-center gap-4">
                <div className="w-1.5 h-12 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-foreground">Sequencial de Facturação Actual:</p>
                  <p className="text-lg font-black text-primary tracking-widest">{fiscalConfig.serieFatura} {new Date().getFullYear()}/{fiscalConfig.proximoNumero}</p>
                </div>
                <Check size={20} className="text-success" />
              </div>
            </div>
          )}

          {/* Notificações Tab */}
          {activeTab === "notificacoes" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 border-b border-border pb-6">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Bell size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">Canais de Alerta</h3>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Configuração de notificações automáticas do sistema.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <ToggleSetting
                  label="Inadimplência de Terceiros"
                  description="Receber alerta imediato quando uma fatura de cliente ultrapassar a data de vencimento."
                  enabled={notifs.fatVencidas}
                  onChange={(v) => setNotifs({ ...notifs, fatVencidas: v })}
                />
                <ToggleSetting
                  label="Vencimento de Obrigações"
                  description="Lembrete proativo 3 dias antes do prazo de liquidação de pagamentos aprovados."
                  enabled={notifs.pagamentosProximos}
                  onChange={(v) => setNotifs({ ...notifs, pagamentosProximos: v })}
                />
                <ToggleSetting
                  label="Compliance INSS"
                  description="Alerta mensal de conformidade antes do dia 10 (limite de entrega)."
                  enabled={notifs.inssVencimento}
                  onChange={(v) => setNotifs({ ...notifs, inssVencimento: v })}
                />
                <ToggleSetting
                  label="Liquidação de IVA"
                  description="Monitorização de prazos para declaração periódica do IVA (até dia 15)."
                  enabled={notifs.ivaVencimento}
                  onChange={(v) => setNotifs({ ...notifs, ivaVencimento: v })}
                />
                <ToggleSetting
                  label="Gargalos de Orçamento"
                  description="Notificar gestores quando a execução de um plafond departamental atingir 85%."
                  enabled={notifs.plafondAlerta}
                  onChange={(v) => setNotifs({ ...notifs, plafondAlerta: v })}
                />
                <ToggleSetting
                  label="Mining de Dados Mensal"
                  description="Gerar e enviar automaticamente o relatório PDF consolidado no dia 1 de cada mês."
                  enabled={notifs.relatorioMensal}
                  onChange={(v) => setNotifs({ ...notifs, relatorioMensal: v })}
                />
              </div>
            </div>
          )}

          {/* Sistema Tab */}
          {activeTab === "sistema" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 border-b border-border pb-6">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Database size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">Core & Infraestrutura</h3>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Monitorização de versão, base de dados e integridade do sistema.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Build do Motor", value: "Core ERP v2.1.0 Gold", icon: Database },
                  { label: "Modo de Operação", value: "Ambiente de Produção (SEC)", icon: Shield },
                  { label: "Protocolo de Dados", value: "PostgreSQL 15 Cluster", icon: Globe },
                  { label: "Backup de Segurança", value: "31/03/2025 02:00 (Auto)", icon: Check },
                  { label: "Storage Consumido", value: "2.4 GB / 10 GB (24%)", icon: Database },
                  { label: "Licenciamento", value: "3 de 10 Seats Activos", icon: Users },
                ].map((item) => (
                  <div key={item.label} className="p-5 rounded-xl bg-muted/20 border border-border/50 group hover:bg-card hover:border-primary/30 transition-all shadow-sm">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                      <item.icon size={12} className="group-hover:text-primary" /> {item.label}
                    </p>
                    <p className="text-[15px] font-black text-foreground tracking-tight">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-primary uppercase tracking-[2px]">Terminal de Manutenção</h4>
                <div className="flex flex-wrap gap-3">
                  {["EXECUTE BACKUP", "EXPORT MASTER DATA", "PURGE CACHE", "SYSTEM LOGS"].map((action) => (
                    <button
                      key={action}
                      className="px-5 py-2.5 rounded-lg border border-border bg-card text-[10px] font-black tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all uppercase"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-destructive/5 border-2 border-destructive/20 relative overflow-hidden group">
                <AlertOctagon size={80} className="absolute -right-4 -bottom-4 text-destructive/10 -rotate-12 transition-transform group-hover:scale-125" />
                <div className="relative">
                  <p className="text-[13px] font-black text-destructive uppercase tracking-widest mb-1 flex items-center gap-2">
                    <AlertOctagon size={18} /> Deep Maintenance Stage
                  </p>
                  <p className="text-[12px] font-medium text-muted-foreground mb-6 max-w-md leading-relaxed">
                    Acções críticas que afectam a integridade global dos dados. Recomenda-se a realização de um snapshot prévio antes de qualquer procedimento nesta zona.
                  </p>
                  <button className="px-6 py-3 rounded-xl bg-destructive text-white font-black text-[10px] tracking-widest shadow-lg shadow-destructive/20 hover:scale-[1.02] active:scale-95 transition-all uppercase">
                    REPOR AMBIENTE DE SIMULAÇÃO (SANDBOX)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}