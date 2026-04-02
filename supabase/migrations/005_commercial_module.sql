-- 1. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    nif TEXT UNIQUE,
    email TEXT,
    phone TEXT,
    address TEXT,
    category TEXT DEFAULT 'Geral',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Invoices Table (Header)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE, -- e.g., FT 2025/1
    series TEXT DEFAULT 'FT',
    year INTEGER DEFAULT extract(year from now()),
    customer_id UUID REFERENCES public.customers(id),
    issue_date DATE DEFAULT current_date,
    due_date DATE,
    subtotal DECIMAL(15,2) DEFAULT 0,
    iva_total DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    status TEXT DEFAULT 'Pendente', -- Pendente, Paga, Vencida, Anulada
    currency TEXT DEFAULT 'AOA',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Invoice Items Table (Details)
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(12,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL,
    iva_percent DECIMAL(5,2) DEFAULT 14,
    total_price DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Automatic Invoice Numbering Function
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    next_val INTEGER;
BEGIN
    -- Get next sequence for the year
    SELECT COALESCE(MAX(CAST(substring(invoice_number from '/([0-9]+)$') AS INTEGER)), 0) + 1
    INTO next_val
    FROM public.invoices
    WHERE year = NEW.year AND series = NEW.series;

    NEW.invoice_number := NEW.series || ' ' || NEW.year || '/' || next_val;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_generate_invoice_number
BEFORE INSERT ON public.invoices
FOR EACH ROW
WHEN (NEW.invoice_number IS NULL)
EXECUTE FUNCTION public.generate_invoice_number();

-- 5. Audit Triggers for Commercial Module
SELECT public.audit_trigger_func('customers');
SELECT public.audit_trigger_func('invoices');

-- 6. RLS Policies
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Allow viewing by anyone with 'commercial.view'
CREATE POLICY "Commercial view customers" ON public.customers
    FOR SELECT USING (has_permission('commercial.view'));

CREATE POLICY "Commercial manage customers" ON public.customers
    FOR ALL USING (has_permission('commercial.manage'));

CREATE POLICY "Commercial view invoices" ON public.invoices
    FOR SELECT USING (has_permission('commercial.view'));

CREATE POLICY "Commercial manage invoices" ON public.invoices
    FOR ALL USING (has_permission('commercial.manage'));
