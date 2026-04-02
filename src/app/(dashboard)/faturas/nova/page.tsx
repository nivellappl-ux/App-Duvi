'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { criarFatura } from '@/lib/actions/fatura.actions'
import { getClientes } from '@/lib/actions/cliente.actions'
import { getProdutos } from '@/lib/actions/produto.actions'
import { calcularTotalFatura } from '@/lib/angola/fatura'
import { formatAOA } from '@/lib/angola/moeda'

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Plus, Trash2, ArrowLeft, Save, Search } from 'lucide-react'
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const faturaSchema = z.object({
    cliente_id: z.string().uuid().optional(),
    cliente_nome: z.string().min(2, 'Nome do cliente é obrigatório'),
    cliente_nif: z.string().optional(),
    data_emissao: z.string().min(1, 'Data de emissão obrigatória'),
    data_vencimento: z.string().optional(),
    notas: z.string().optional(),
    itens: z.array(z.object({
        produto_id: z.string().uuid().optional(),
        descricao: z.string().min(1, 'Descrição obrigatória'),
        quantidade: z.number().min(1),
        preco_unitario: z.number().min(0),
        taxa_iva: z.number().min(0).max(100),
        desconto_pct: z.number().min(0).max(100)
    })).min(1, 'Adicione pelo menos um item')
})

type FaturaFormValues = z.infer<typeof faturaSchema>

export default function NovaFaturaPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [clientes, setClientes] = useState<any[]>([])
    const [produtos, setProdutos] = useState<any[]>([])

    const form = useForm<FaturaFormValues>({
        resolver: zodResolver(faturaSchema),
        defaultValues: {
            cliente_nome: '',
            cliente_nif: '',
            data_emissao: new Date().toISOString().split('T')[0],
            itens: [{ descricao: '', quantidade: 1, preco_unitario: 0, taxa_iva: 14, desconto_pct: 0 }]
        }
    })

    const { fields, append, remove, update } = useFieldArray({
        name: 'itens',
        control: form.control
    })

    useEffect(() => {
        const loadInitialData = async () => {
            const [c, p] = await Promise.all([getClientes(), getProdutos()])
            setClientes(c)
            setProdutos(p)
        }
        loadInitialData()
    }, [])

    const watchItens = form.watch('itens')
    const totais = calcularTotalFatura(watchItens.map(i => ({
        quantidade: Number(i.quantidade) || 0,
        precoUnitario: Number(i.preco_unitario) || 0,
        taxaIVA: Number(i.taxa_iva) || 0,
        descontoPct: Number(i.desconto_pct) || 0,
    })))

    async function onSubmit(data: FaturaFormValues) {
        setIsSubmitting(true)
        try {
            const resp = await criarFatura(data)
            if (resp.erro) {
                toast.error('Erro ao criar fatura', { description: JSON.stringify(resp.erro) })
            } else {
                toast.success('Fatura emitida com sucesso!')
                router.push('/faturas')
            }
        } catch (e) {
            toast.error('Erro de servidor')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSelectCliente = (id: string) => {
        const cliente = clientes.find(c => c.id === id)
        if (cliente) {
            form.setValue('cliente_id', cliente.id)
            form.setValue('cliente_nome', cliente.nome)
            form.setValue('cliente_nif', cliente.nif || '')
        }
    }

    const handleSelectProduto = (index: number, id: string) => {
        const produto = produtos.find(p => p.id === id)
        if (produto) {
            update(index, {
                ...fields[index],
                produto_id: produto.id,
                descricao: produto.nome,
                preco_unitario: produto.preco_venda,
            })
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/faturas">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 italic">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Emissão de Fatura</h1>
                    <p className="text-slate-500 text-sm">Preencha os dados abaixo para gerar um documento comercial válido.</p>
                </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="border-b bg-slate-50/50 py-4">
                                <CardTitle className="text-base font-semibold">Cabeçalho & Cliente</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Selecionar Cliente Salvo</Label>
                                    <Select onValueChange={(val: any) => handleSelectCliente(val)}>
                                        <SelectTrigger className="bg-blue-50/30 border-blue-100">
                                            <SelectValue placeholder="Escolha um cliente da lista..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clientes.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.nome} ({c.nif || 'Sem NIF'})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cliente_nome">Nome / Razão Social *</Label>
                                    <Input id="cliente_nome" {...form.register('cliente_nome')} placeholder="Ou digite o nome manualmente..." />
                                    {form.formState.errors.cliente_nome && <p className="text-red-500 text-[10px]">{form.formState.errors.cliente_nome.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cliente_nif">NIF</Label>
                                    <Input id="cliente_nif" {...form.register('cliente_nif')} placeholder="NIF do cliente" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="data_emissao">Data de Emissão *</Label>
                                    <Input id="data_emissao" type="date" {...form.register('data_emissao')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                                    <Input id="data_vencimento" type="date" {...form.register('data_vencimento')} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="border-b bg-slate-50/50 py-4 flex flex-row items-center justify-between">
                                <CardTitle className="text-base font-semibold">Itens da Fatura</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ descricao: '', quantidade: 1, preco_unitario: 0, taxa_iva: 14, desconto_pct: 0 })} className="h-8 text-xs">
                                    <Plus className="h-3 w-3 mr-1" /> Adicionar Linha
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-6">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="space-y-3 p-4 rounded-xl border bg-slate-50/30 relative group">
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                                <div className="md:col-span-5 space-y-2">
                                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Produto / Serviço</Label>
                                                    <div className="flex gap-2">
                                                        <Select onValueChange={(val: any) => handleSelectProduto(index, val)}>
                                                            <SelectTrigger className="w-[40px] px-0 justify-center">
                                                                <Search className="h-3 w-3 text-slate-400" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {produtos.map((p: any) => (
                                                                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Input placeholder="Descrição do item..." {...form.register(`itens.${index}.descricao`)} className="flex-1" />
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2 space-y-2">
                                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Quantidade</Label>
                                                    <Input type="number" {...form.register(`itens.${index}.quantidade`, { valueAsNumber: true })} />
                                                </div>
                                                <div className="md:col-span-3 space-y-2">
                                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Preço Unit.</Label>
                                                    <Input type="number" step="0.01" {...form.register(`itens.${index}.preco_unitario`, { valueAsNumber: true })} />
                                                </div>
                                                <div className="md:col-span-2 flex flex-col justify-end pb-1">
                                                    <div className="text-right">
                                                        <span className="text-[10px] text-slate-400 block mb-1">Subtotal</span>
                                                        <span className="font-bold text-slate-700">{formatAOA(totais.linhas[index]?.total || 0)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                                                <div className="flex items-center gap-2">
                                                    <Label className="text-xs text-slate-400 shrink-0">IVA %</Label>
                                                    <Input className="h-8 py-0" type="number" {...form.register(`itens.${index}.taxa_iva`, { valueAsNumber: true })} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Label className="text-xs text-slate-400 shrink-0">Desc %</Label>
                                                    <Input className="h-8 py-0" type="number" {...form.register(`itens.${index}.desconto_pct`, { valueAsNumber: true })} />
                                                </div>
                                                <div className="md:col-span-2 flex justify-end">
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} disabled={fields.length === 1} className="text-red-400 hover:text-red-500 h-8 px-2 transition-all">
                                                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Remover
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="sticky top-6 border-blue-100 bg-blue-50/20">
                            <CardHeader className="bg-blue-600 rounded-t-lg">
                                <CardTitle className="text-white text-base">Resumo Financeiro</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Subtotal</span>
                                    <span className="font-medium">{formatAOA(totais.subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Impostos (IVA)</span>
                                    <span className="font-medium text-amber-600">{formatAOA(totais.totalIVA)}</span>
                                </div>
                                <div className="pt-4 border-t border-blue-100">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Final</span>
                                            <div className="text-2xl font-black text-slate-900">{formatAOA(totais.total)}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 pb-6 flex flex-col gap-3">
                                <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-bold shadow-lg shadow-blue-200">
                                    {isSubmitting ? 'A Processar...' : 'Validar & Emitir'}
                                    {!isSubmitting && <Save className="ml-2 h-4 w-4" />}
                                </Button>
                                <p className="text-[10px] text-center text-slate-400">Este documento será registado em conformidade com as regras da AGT.</p>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader className="py-4 border-b">
                                <CardTitle className="text-xs font-bold uppercase text-slate-400">Notas Adicionais</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <textarea
                                    className="w-full h-32 p-3 text-sm rounded-lg border bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Ex: Dados bancários para transferência..."
                                    {...form.register('notas')}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    )
}
