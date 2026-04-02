'use client'
import { useState, useEffect } from 'react'
import { Plus, Search, Package, AlertTriangle, MoreVertical, Edit, Trash2, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getProdutos, eliminarProduto, criarProduto, atualizarStock } from '@/lib/actions/produto.actions'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function ProdutosPage() {
    const [produtos, setProdutos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newProduto, setNewProduto] = useState({
        nome: '',
        descricao: '',
        preco_venda: 0,
        stock_actual: 0,
        stock_minimo: 5,
        categoria: ''
    })

    const loadProdutos = async () => {
        setLoading(true)
        const data = await getProdutos()
        setProdutos(data)
        setLoading(false)
    }

    useEffect(() => {
        loadProdutos()
    }, [])

    const filteredProdutos = produtos.filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await criarProduto(newProduto)
        if (res.erro) {
            toast.error(typeof res.erro === 'string' ? res.erro : 'Erro ao criar produto')
        } else {
            toast.success('Produto criado com sucesso')
            setIsAddOpen(false)
            setNewProduto({ nome: '', descricao: '', preco_venda: 0, stock_actual: 0, stock_minimo: 5, categoria: '' })
            loadProdutos()
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem a certeza que deseja eliminar este produto?')) return
        const res = await eliminarProduto(id)
        if (res.erro) {
            toast.error(res.erro)
        } else {
            toast.success('Produto eliminado')
            loadProdutos()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Produtos & Inventário</h1>
                    <p className="text-muted-foreground">Gerencie o seu catálogo de produtos e níveis de stock.</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    {(DialogTrigger as any)({
                        asChild: true, children: (
                            <Button className="bg-[#004BD3] hover:bg-[#003bb0]">
                                <Plus className="mr-2 h-4 w-4" /> Novo Produto
                            </Button>
                        )
                    })}
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Adicionar Novo Produto</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nome">Nome do Produto</Label>
                                <Input
                                    id="nome"
                                    value={newProduto.nome}
                                    onChange={e => setNewProduto({ ...newProduto, nome: e.target.value })}
                                    placeholder="Ex: Teclado Mecânico RGB"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="categoria">Categoria</Label>
                                    <Input
                                        id="categoria"
                                        value={newProduto.categoria}
                                        onChange={e => setNewProduto({ ...newProduto, categoria: e.target.value })}
                                        placeholder="Ex: Hardware"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="preco">Preço de Venda (AOA)</Label>
                                    <Input
                                        id="preco"
                                        type="number"
                                        value={newProduto.preco_venda}
                                        onChange={e => setNewProduto({ ...newProduto, preco_venda: Number(e.target.value) })}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="stock">Stock Actual</Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        value={newProduto.stock_actual}
                                        onChange={e => setNewProduto({ ...newProduto, stock_actual: Number(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="min">Stock Mínimo</Label>
                                    <Input
                                        id="min"
                                        type="number"
                                        value={newProduto.stock_minimo}
                                        onChange={e => setNewProduto({ ...newProduto, stock_minimo: Number(e.target.value) })}
                                        placeholder="5"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="bg-[#004BD3] hover:bg-[#003bb0]">Salvar Produto</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="p-0 border-none shadow-sm overflow-hidden">
                <div className="p-4 bg-white border-b flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Pesquisar por nome ou categoria..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead>Produto</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Preço Unit.</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        Carregando catálogo...
                                    </TableCell>
                                </TableRow>
                            ) : filteredProdutos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        Nenhum produto encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProdutos.map((produto) => (
                                    <TableRow key={produto.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell>
                                            <div className="font-medium">{produto.nome}</div>
                                            <div className="text-xs text-muted-foreground line-clamp-1">
                                                {produto.descricao || 'Sem descrição'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-white">
                                                {produto.categoria || 'Geral'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold">{produto.stock_actual} items</div>
                                                {produto.stock_actual <= produto.stock_minimo && (
                                                    <Badge variant="destructive" className="h-5 px-1.5 gap-1">
                                                        <AlertTriangle className="h-3 w-3" /> Baixo
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground italic">
                                                Mínimo configurado: {produto.stock_minimo}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-semibold text-blue-600">
                                                {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(produto.preco_venda)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDelete(produto.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}
