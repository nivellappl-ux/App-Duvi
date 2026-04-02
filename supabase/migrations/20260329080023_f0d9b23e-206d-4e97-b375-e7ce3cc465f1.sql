-- Finance OS Entrega A - secure base schema and RBAC

create extension if not exists pgcrypto;

-- Roles enum required by project security rules
create type public.app_role as enum ('super_admin', 'gestor', 'financeiro', 'rh', 'visualizador');

-- Generic updated_at trigger helper
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  must_change_password boolean not null default true,
  failed_login_attempts integer not null default 0,
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Roles must be in separate table (critical security rule)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);

-- Core business tables (foundation)
create table public.company_settings (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  nif text,
  address text,
  currency text not null default 'AOA',
  iva_percent numeric(5,2) not null default 14,
  inss_worker_percent numeric(5,2) not null default 3,
  inss_employer_percent numeric(5,2) not null default 8,
  session_hours integer not null default 8,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  monthly_plafond numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  account_name text not null,
  bank_name text,
  iban text,
  balance numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  type text not null check (type in ('entrada','saida','transferencia')),
  category text not null,
  amount numeric(14,2) not null check (amount > 0),
  description text,
  reference text,
  department_id uuid references public.departments(id) on delete set null,
  bank_account_id uuid references public.bank_accounts(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.fiscal_obligations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  due_date date not null,
  status text not null default 'pendente' check (status in ('pendente','pago','atrasado')),
  amount numeric(14,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  department_id uuid references public.departments(id) on delete set null,
  position text,
  base_salary numeric(14,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  module text not null,
  target_table text,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Role helper to avoid recursive RLS
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

create or replace function public.can_access_finance(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(_user_id, 'super_admin')
      or public.has_role(_user_id, 'gestor')
      or public.has_role(_user_id, 'financeiro')
      or public.has_role(_user_id, 'visualizador')
$$;

create or replace function public.can_access_hr(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(_user_id, 'super_admin')
      or public.has_role(_user_id, 'gestor')
      or public.has_role(_user_id, 'rh')
      or public.has_role(_user_id, 'visualizador')
$$;

-- Auto profile on signup (for admin-created auth users)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)))
  on conflict (user_id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'visualizador')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Derived state trigger for bank balances from transactions
create or replace function public.apply_transaction_to_balance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.bank_account_id is null then
    return new;
  end if;

  if new.type = 'entrada' then
    update public.bank_accounts set balance = balance + new.amount where id = new.bank_account_id;
  elsif new.type = 'saida' then
    update public.bank_accounts set balance = balance - new.amount where id = new.bank_account_id;
  end if;

  return new;
end;
$$;

create trigger trg_apply_transaction_to_balance
after insert on public.transactions
for each row execute function public.apply_transaction_to_balance();

-- updated_at triggers
create trigger trg_profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at_column();
create trigger trg_company_settings_updated_at before update on public.company_settings for each row execute function public.update_updated_at_column();
create trigger trg_departments_updated_at before update on public.departments for each row execute function public.update_updated_at_column();
create trigger trg_bank_accounts_updated_at before update on public.bank_accounts for each row execute function public.update_updated_at_column();
create trigger trg_transactions_updated_at before update on public.transactions for each row execute function public.update_updated_at_column();
create trigger trg_fiscal_obligations_updated_at before update on public.fiscal_obligations for each row execute function public.update_updated_at_column();
create trigger trg_employees_updated_at before update on public.employees for each row execute function public.update_updated_at_column();

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.company_settings enable row level security;
alter table public.departments enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.fiscal_obligations enable row level security;
alter table public.employees enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles policies
create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = user_id or public.has_role(auth.uid(), 'super_admin') or public.has_role(auth.uid(), 'gestor'));

create policy "Users can update own profile basic fields"
on public.profiles for update
using (auth.uid() = user_id or public.has_role(auth.uid(), 'super_admin'))
with check (auth.uid() = user_id or public.has_role(auth.uid(), 'super_admin'));

create policy "Admins can insert profiles"
on public.profiles for insert
with check (public.has_role(auth.uid(), 'super_admin'));

-- User roles policies
create policy "Users can view own roles"
on public.user_roles for select
using (user_id = auth.uid() or public.has_role(auth.uid(), 'super_admin') or public.has_role(auth.uid(), 'gestor'));

create policy "Super admins manage roles"
on public.user_roles for all
using (public.has_role(auth.uid(), 'super_admin'))
with check (public.has_role(auth.uid(), 'super_admin'));

-- Finance access policies
create policy "Finance read company settings"
on public.company_settings for select
using (public.can_access_finance(auth.uid()));

create policy "Finance update company settings by admin"
on public.company_settings for all
using (public.has_role(auth.uid(), 'super_admin'))
with check (public.has_role(auth.uid(), 'super_admin'));

create policy "Finance read departments"
on public.departments for select
using (public.can_access_finance(auth.uid()) or public.can_access_hr(auth.uid()));

create policy "Finance manage departments"
on public.departments for all
using (public.has_role(auth.uid(), 'super_admin') or public.has_role(auth.uid(), 'gestor') or public.has_role(auth.uid(), 'financeiro'))
with check (public.has_role(auth.uid(), 'super_admin') or public.has_role(auth.uid(), 'gestor') or public.has_role(auth.uid(), 'financeiro'));

create policy "Finance read bank accounts"
on public.bank_accounts for select
using (public.can_access_finance(auth.uid()));

create policy "Finance manage bank accounts"
on public.bank_accounts for all
using (public.has_role(auth.uid(), 'super_admin') or public.has_role(auth.uid(), 'gestor') or public.has_role(auth.uid(), 'financeiro'))
with check (public.has_role(auth.uid(), 'super_admin') or public.has_role(auth.uid(), 'gestor') or public.has_role(auth.uid(), 'financeiro'));

create policy "Finance read transactions"
on public.transactions for select
using (public.can_access_finance(auth.uid()));

create policy "Finance insert transactions"
on public.transactions for insert
with check (
  (public.has_role(auth.uid(), 'super_admin') or public.has_role(auth.uid(), 'gestor') or public.has_role(auth.uid(), 'financeiro'))
  and created_by = auth.uid()
);

create policy "Finance update transactions"
on public.transactions for update
using (public.has_role(auth.uid(), 'super_admin') or public.has_role(auth.uid(), 'gestor') or public.has_role(auth.uid(), 'financeiro'))
with check (public.has_role(auth.uid(), 'super_admin') or public.has_role(auth.uid(), 'gestor') or public.has_role(auth.uid(), 'financeiro'));

-- Fiscal policies
create policy "Finance read fiscal obligations"
on public.fiscal_obligations for select
using (public.can_access_finance(auth.uid()));

create policy "Finance manage fiscal obligations"
on public.fiscal_obligations for all
using (public.has_role(auth.uid(), 'super_admin') or public.has_role(auth.uid(), 'gestor') or public.has_role(auth.uid(), 'financeiro'))
with check (public.has_role(auth.uid(), 'super_admin') or public.has_role(auth.uid(), 'gestor') or public.has_role(auth.uid(), 'financeiro'));

-- HR policies
create policy "HR read employees"
on public.employees for select
using (public.can_access_hr(auth.uid()));

create policy "HR manage employees"
on public.employees for all
using (public.has_role(auth.uid(), 'super_admin') or public.has_role(auth.uid(), 'gestor') or public.has_role(auth.uid(), 'rh'))
with check (public.has_role(auth.uid(), 'super_admin') or public.has_role(auth.uid(), 'gestor') or public.has_role(auth.uid(), 'rh'));

-- Audit policies
create policy "Only super admins read audit logs"
on public.audit_logs for select
using (public.has_role(auth.uid(), 'super_admin'));

create policy "Authenticated users can insert audit logs"
on public.audit_logs for insert
to authenticated
with check (auth.uid() = actor_user_id);

-- Useful indexes
create index idx_profiles_user_id on public.profiles(user_id);
create index idx_user_roles_user_id on public.user_roles(user_id);
create index idx_user_roles_role on public.user_roles(role);
create index idx_transactions_occurred_at on public.transactions(occurred_at desc);
create index idx_transactions_department_id on public.transactions(department_id);
create index idx_transactions_bank_account_id on public.transactions(bank_account_id);
create index idx_audit_logs_actor_user_id on public.audit_logs(actor_user_id);
create index idx_audit_logs_created_at on public.audit_logs(created_at desc);