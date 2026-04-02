export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            faturas: {
                Row: { id: string; numero: string; cliente_nome: string; total: number; estado: string; empresa_id: string; created_at: string; cliente_id: string | null; cliente_nif: string | null; data_emissao: string; data_vencimento: string | null; notas: string | null; subtotal: number; total_iva: number; criado_por: string | null };
                Insert: {
                    empresa_id: string;
                    numero: string;
                    cliente_id?: string | null;
                    cliente_nome: string;
                    cliente_nif?: string | null;
                    data_emissao: string;
                    data_vencimento?: string | null;
                    notas?: string | null;
                    subtotal: number;
                    total_iva: number;
                    total: number;
                    estado?: string;
                    criado_por?: string | null;
                    created_at?: string;
                };
                Update: Partial<Database['public']['Tables']['faturas']['Insert']>;
            };
            clientes: {
                Row: { id: string; activo: boolean; count: number };
                Insert: { id?: string; activo?: boolean; count?: number };
                Update: Partial<Database['public']['Tables']['clientes']['Insert']>;
            };
            produtos: {
                Row: { id: string; nome: string; stock_actual: number; stock_minimo: number };
                Insert: { id?: string; nome: string; stock_actual?: number; stock_minimo?: number };
                Update: Partial<Database['public']['Tables']['produtos']['Insert']>;
            };
            utilizadores: {
                Row: { id: string; empresa_id: string };
                Insert: { id: string; empresa_id: string };
                Update: Partial<Database['public']['Tables']['utilizadores']['Insert']>;
            };
            fatura_itens: {
                Row: { id: string; fatura_id: string; produto_id: string | null; descricao: string; quantidade: number; preco_unitario: number; taxa_iva: number; desconto_percent: number; subtotal: number; valor_iva: number; total: number; ordem: number };
                Insert: {
                    fatura_id: string;
                    produto_id?: string | null;
                    descricao: string;
                    quantidade: number;
                    preco_unitario: number;
                    taxa_iva: number;
                    desconto_percent?: number;
                    subtotal: number;
                    valor_iva: number;
                    total: number;
                    ordem: number;
                };
                Update: Partial<Database['public']['Tables']['fatura_itens']['Insert']>;
            };
            pagamentos: {
                Row: { id: string; empresa_id: string; fatura_id: string; valor: number; metodo: string; data_pagamento: string; criado_por: string | null };
                Insert: {
                    empresa_id: string;
                    fatura_id: string;
                    valor: number;
                    metodo: string;
                    data_pagamento: string;
                    criado_por?: string | null;
                };
                Update: Partial<Database['public']['Tables']['pagamentos']['Insert']>;
            };
            funcionarios: {
                Row: { id: string; numero: string; nome: string; cargo: string; activo: boolean; salario_base: number; subsidio_alimentacao: number; subsidio_transporte: number; outros_subsidios: number };
                Insert: { id?: string; numero: string; nome: string; cargo: string; activo?: boolean; salario_base: number; subsidio_alimentacao?: number; subsidio_transporte?: number; outros_subsidios?: number };
                Update: Partial<Database['public']['Tables']['funcionarios']['Insert']>;
            };
        };
        Views: { [key: string]: any };
        Functions: { [key: string]: any };
    }
}
