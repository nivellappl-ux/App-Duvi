'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const ProdutoSchema = z.object({
    nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    descricao: z.string().optional(),
    preco_venda: z.number().min(0),
    preco_custo: z.number().min(0).optional(),
    stock_actual: z.number().int().default(0),
    stock_minimo: z.number().int().default(5),
    categoria: z.string().optional(),
})

export async function getProdutos() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: util } = await supabase.from('utilizadores')
        .select('empresa_id').eq('id', user.id).single()
    if (!util) return []

    const { data } = await supabase.from('produtos')
        .select('*')
        .eq('empresa_id', (util as any).empresa_id)
        .order('nome', { ascending: true })

    return data || []
}

export async function criarProduto(formData: z.infer<typeof ProdutoSchema>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { erro: 'Não autenticado' }

    const parsed = ProdutoSchema.safeParse(formData)
    if (!parsed.success) return { erro: parsed.error.flatten() }

    const { data: util } = await supabase.from('utilizadores')
        .select('empresa_id').eq('id', user.id).single()
    if (!util) return { erro: 'Utilizador sem empresa' }

    const { data, error } = await supabase.from('produtos').insert({
        ...parsed.data,
        empresa_id: (util as any).empresa_id,
    } as any).select().single() as any

    if (error) return { erro: error.message }

    revalidatePath('/produtos')
    revalidatePath('/inventario')
    return { sucesso: true, data }
}

export async function atualizarStock(id: string, quantidade: number) {
    const supabase = await createClient()
    const { error } = await (supabase.from('produtos') as any)
        .update({ stock_actual: quantidade } as any)
        .eq('id', id)

    if (error) return { erro: error.message }

    revalidatePath('/produtos')
    revalidatePath('/inventario')
    return { sucesso: true }
}

export async function eliminarProduto(id: string) {
    const supabase = await createClient()
    const { error } = await (supabase.from('produtos') as any)
        .delete()
        .eq('id', id)

    if (error) return { erro: error.message }

    revalidatePath('/produtos')
    return { sucesso: true }
}
