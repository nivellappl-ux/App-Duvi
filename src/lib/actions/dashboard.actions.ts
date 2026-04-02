'use server'
import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: util } = await supabase.from('utilizadores')
        .select('empresa_id').eq('id', user.id).single()
    if (!util) return null

    const empresaId = (util as any).empresa_id

    const [
        { data: faturas },
        { data: clientes },
        { data: produtos },
        { data: pagamentos }
    ] = await Promise.all([
        supabase.from('faturas').select('total, estado').eq('empresa_id', empresaId) as any,
        supabase.from('clientes').select('id', { count: 'exact' }).eq('empresa_id', empresaId) as any,
        supabase.from('produtos').select('id', { count: 'exact' }).eq('empresa_id', empresaId) as any,
        supabase.from('pagamentos').select('valor').eq('empresa_id', empresaId) as any,
    ])

    const totalEmitido = (faturas as any)?.reduce((acc: any, f: any) => acc + (f.total || 0), 0) || 0
    const totalPago = (pagamentos as any)?.reduce((acc: any, p: any) => acc + (p.valor || 0), 0) || 0
    const pendentes = (faturas as any)?.filter((f: any) => f.estado === 'emitida' || f.estado === 'pendente').length || 0

    return {
        totalEmitido,
        totalPago,
        totalPendente: totalEmitido - totalPago,
        numClientes: clientes?.length || 0,
        numProdutos: produtos?.length || 0,
        faturasPendentes: pendentes,
    }
}
