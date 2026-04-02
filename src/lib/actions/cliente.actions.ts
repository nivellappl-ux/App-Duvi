'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const ClienteSchema = z.object({
    nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    nif: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    telefone: z.string().optional(),
    morada: z.string().optional(),
    website: z.string().url('URL inválida').optional().or(z.literal('')),
})

export async function getClientes() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: util } = await supabase.from('utilizadores')
        .select('empresa_id').eq('id', user.id).single()
    if (!util) return []

    const { data } = await supabase.from('clientes')
        .select('*')
        .eq('empresa_id', (util as any).empresa_id)
        .order('nome', { ascending: true })

    return data || []
}

export async function criarCliente(formData: z.infer<typeof ClienteSchema>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { erro: 'Não autenticado' }

    const parsed = ClienteSchema.safeParse(formData)
    if (!parsed.success) return { erro: parsed.error.flatten() }

    const { data: util } = await supabase.from('utilizadores')
        .select('empresa_id').eq('id', user.id).single()
    if (!util) return { erro: 'Utilizador sem empresa' }

    const { data, error } = await supabase.from('clientes').insert({
        ...parsed.data,
        empresa_id: (util as any).empresa_id,
        activo: true
    } as any).select().single() as any

    if (error) return { erro: error.message }

    revalidatePath('/clientes')
    return { sucesso: true, data }
}

export async function atualizarCliente(id: string, formData: Partial<z.infer<typeof ClienteSchema>>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { erro: 'Não autenticado' }

    const { error } = await (supabase.from('clientes') as any)
        .update(formData as any)
        .eq('id', id)

    if (error) return { erro: error.message }

    revalidatePath('/clientes')
    return { sucesso: true }
}

export async function eliminarCliente(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { erro: 'Não autenticado' }

    const { error } = await (supabase.from('clientes') as any)
        .delete()
        .eq('id', id)

    if (error) return { erro: error.message }

    revalidatePath('/clientes')
    return { sucesso: true }
}
