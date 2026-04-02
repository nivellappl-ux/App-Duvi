export type AppRole = "super_admin" | "gestor" | "financeiro" | "rh" | "visualizador";

export type ModuleKey =
  | "dashboard"
  | "faturacao"
  | "clientes"
  | "financeiro"
  | "conta_bancaria"
  | "rh"
  | "plafond"
  | "fiscalidade"
  | "documentos"
  | "relatorios"
  | "utilizadores"
  | "configuracoes";

export const roleLabel: Record<AppRole, string> = {
  super_admin: "Super Admin",
  gestor: "Gestor",
  financeiro: "Financeiro",
  rh: "RH",
  visualizador: "Visualizador",
};

const moduleRoles: Record<ModuleKey, AppRole[]> = {
  dashboard: ["super_admin", "gestor", "financeiro", "rh", "visualizador"],
  faturacao: ["super_admin", "gestor", "financeiro"],
  clientes: ["super_admin", "gestor", "financeiro", "visualizador"],
  financeiro: ["super_admin", "gestor", "financeiro"],
  conta_bancaria: ["super_admin", "gestor", "financeiro", "visualizador"],
  rh: ["super_admin", "gestor", "rh"],
  plafond: ["super_admin", "gestor", "financeiro"],
  fiscalidade: ["super_admin", "gestor", "financeiro", "visualizador"],
  documentos: ["super_admin", "gestor", "financeiro", "rh", "visualizador"],
  relatorios: ["super_admin", "gestor", "financeiro", "visualizador"],
  utilizadores: ["super_admin", "gestor"],
  configuracoes: ["super_admin", "gestor"],
};

export const canAccessModule = (role: AppRole | null, moduleKey: ModuleKey) => {
  if (!role) return false;
  return moduleRoles[moduleKey].includes(role);
};

export const defaultRouteByRole = (role: AppRole | null) => {
  if (!role) return "/login";
  if (role === "rh") return "/rh";
  if (role === "visualizador") return "/dashboard";
  return "/dashboard";
};