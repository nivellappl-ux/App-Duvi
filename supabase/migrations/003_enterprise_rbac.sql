-- Duvion Enterprise: Granular RBAC (Phase 1)

-- 1. Permissões (Cada ação atómica no sistema)
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- ex: 'finance.approve', 'user.create'
  description TEXT,
  module TEXT NOT NULL, -- ex: 'finance', 'hr', 'admin'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Associação de Permissões a Roles (RBAC Progressivo)
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission_name TEXT NOT NULL REFERENCES public.permissions(name) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role, permission_name)
);

-- 3. Função Helper para verificar Permissão Granular
-- Substitui a verificação estática por roles
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = _user_id
      AND (rp.permission_name = _permission OR ur.role = 'super_admin')
  )
$$;

-- 4. Initial Seed for Permissions
INSERT INTO public.permissions (name, description, module) VALUES
('user.view', 'Visualizar utilizadores e perfis', 'admin'),
('user.create', 'Criar novos utilizadores (apenas admin)', 'admin'),
('user.edit', 'Editar utilizadores existentes', 'admin'),
('finance.view', 'Visualizar dados financeiros', 'finance'),
('finance.request', 'Criar solicitações financeiras', 'finance'),
('finance.approve', 'Aprovar transações financeiras', 'finance'),
('hr.view', 'Visualizar dados de RH', 'hr'),
('hr.manage', 'Gerir funcionários e folhas de salário', 'hr'),
('audit.view', 'Visualizar logs de auditoria completa', 'admin')
ON CONFLICT (name) DO NOTHING;

-- 5. Default Role Mappings
INSERT INTO public.role_permissions (role, permission_name) VALUES
-- super_admin (gets everything via has_permission logic, but explicit for clarity)
('super_admin', 'user.view'),
('super_admin', 'user.create'),
('super_admin', 'audit.view'),
-- gestor
('gestor', 'user.view'),
('gestor', 'finance.view'),
('gestor', 'finance.approve'),
('gestor', 'hr.view'),
-- financeiro
('financeiro', 'finance.view'),
('financeiro', 'finance.request'),
-- rh
('rh', 'hr.view'),
('rh', 'hr.manage'),
-- visualizador
('visualizador', 'finance.view'),
('visualizador', 'hr.view')
ON CONFLICT DO NOTHING;

-- 6. RLS para as novas tabelas
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage permissions" ON public.permissions FOR ALL 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins manage role_permissions" ON public.role_permissions FOR ALL 
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Everyone reads permissions" ON public.permissions FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Everyone reads role_permissions" ON public.role_permissions FOR SELECT 
TO authenticated USING (true);
