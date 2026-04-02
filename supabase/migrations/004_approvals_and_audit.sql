-- Duvion Enterprise: Approvals & Audit (Phase 1)

-- 1. Fluxo de Aprovação de Operações (Workflow State Machine)
CREATE TABLE IF NOT EXISTS public.operation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id),
  operation_type TEXT NOT NULL CHECK (operation_type IN ('pagamento', 'transferencia', 'eliminação', 'configuração')),
  payload JSONB NOT NULL, -- Dados da operação solicitada
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'concluido')),
  approver_id UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Auditoria Avançada (Rastreabilidade Total)
-- Recriar ou Alterar audit_logs para suportar IP e detalhes granulares
ALTER TABLE IF EXISTS public.audit_logs 
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS old_record JSONB,
ADD COLUMN IF NOT EXISTS new_record JSONB,
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical'));

-- 3. Função de Gatilho de Auditoria Genérica
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_action TEXT := TG_OP;
  v_table TEXT := TG_TABLE_NAME;
  v_old_data JSONB := CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END;
  v_new_data JSONB := CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END;
BEGIN
  INSERT INTO public.audit_logs (
    actor_user_id,
    action,
    module,
    target_table,
    target_id,
    old_record,
    new_record,
    metadata
  ) VALUES (
    v_user_id,
    v_action,
    'database_trigger',
    v_table,
    COALESCE(NEW.id, OLD.id),
    v_old_data,
    v_new_data,
    jsonb_build_object('trigger_at', now())
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- 4. Aplicar Auditoria em Tabelas Sensíveis
-- Transações (Financeiro)
DROP TRIGGER IF EXISTS audit_transactions ON public.transactions;
CREATE TRIGGER audit_transactions
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Perfis e Roles (Segurança)
DROP TRIGGER IF EXISTS audit_profiles ON public.profiles;
CREATE TRIGGER audit_profiles
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- 5. RLS para Operation Requests
ALTER TABLE public.operation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read requests" ON public.operation_requests FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Users can create requests" ON public.operation_requests FOR INSERT 
TO authenticated WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Supervisors manage requests" ON public.operation_requests FOR UPDATE 
USING (public.has_permission(auth.uid(), 'finance.approve'));

-- 6. updated_at triggers
CREATE TRIGGER trg_operation_requests_updated_at BEFORE UPDATE ON public.operation_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
