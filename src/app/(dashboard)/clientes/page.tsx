'use client'
import { useState, useEffect } from 'react'
import { Plus, Search, Mail, Phone, MapPin, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
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
import { getClientes, eliminarCliente, criarCliente } from '@/lib/actions/cliente.actions'
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

export default function ClientesPage() {
    const [clientes, setClientes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newCliente, setNewCliente] = useState({
        nome: '',
        nif: '',
        email: '',
        telefone: '',
        morada: ''
    })

    const loadClientes = async () => {
        setLoading(true)
        const data = await getClientes()
        setClientes(data)
        setLoading(false)
    }

    useEffect(() => {
        loadClientes()
    }, [])

    const filteredClientes = clientes.filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nif?.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await criarCliente(newCliente)
        if (res.erro) {
            toast.error(typeof res.erro === 'string' ? res.erro : 'Erro ao criar cliente')
        } else {
            toast.success('Cliente criado com sucesso')
            setIsAddOpen(false)
            setNewCliente({ nome: '', nif: '', email: '', telefone: '', morada: '' })
            loadClientes()
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem a certeza que deseja eliminar este cliente?')) return
        const res = await eliminarCliente(id)
        if (res.erro) {
            toast.error(res.erro)
        } else {
            toast.success('Cliente eliminado')
            loadClientes()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
                    <p className="text-muted-foreground">Gerencie o cadastro de seus clientes e parceiros.</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    {(DialogTrigger as any)({
                        asChild: true, children: (
                            <Button className="bg-[#004BD3] hover:bg-[#003bb0]">
                                <Plus className="mr-2 h-4 w-4" /> Novo Cliente
                            </Button>
                        )
                    })}
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nome">Nome / Razão Social</Label>
                                <Input
                                    id="nome"
                                    value={newCliente.nome}
                                    onChange={e => setNewCliente({ ...newCliente, nome: e.target.value })}
                                    placeholder="Ex: Empresa de Exemplo, Lda"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="nif">NIF</Label>
                                    <Input
                                        id="nif"
                                        value={newCliente.nif}
                                        onChange={e => setNewCliente({ ...newCliente, nif: e.target.value })}
                                        placeholder="5400000000"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="telefone">Telefone</Label>
                                    <Input
                                        id="telefone"
                                        value={newCliente.telefone}
                                        onChange={e => setNewCliente({ ...newCliente, telefone: e.target.value })}
                                        placeholder="+244 9..."
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={newCliente.email}
                                    onChange={e => setNewCliente({ ...newCliente, email: e.target.value })}
                                    placeholder="cliente@exemplo.com"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="morada">Morada</Label>
                                <Input
                                    id="morada"
                                    value={newCliente.morada}
                                    onChange={e => setNewCliente({ ...newCliente, morada: e.target.value })}
                                    placeholder="Rua Exemplo, Luanda"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="bg-[#004BD3] hover:bg-[#003bb0]">Salvar Cliente</Button>
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
                            placeholder="Pesquisar por nome, NIF ou email..."
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
                                <TableHead>Cliente</TableHead>
                                <TableHead>NIF</TableHead>
                                <TableHead>Contacto</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        Carregando clientes...
                                    </TableCell>
                                </TableRow>
                            ) : filteredClientes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        Nenhum cliente encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredClientes.map((cliente) => (
                                    <TableRow key={cliente.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell>
                                            <div className="font-medium">{cliente.nome}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <MapPin className="h-3 w-3" /> {cliente.morada || 'Sem endereço'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                                                {cliente.nif || 'Não inf.'}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {cliente.email && (
                                                    <div className="text-xs flex items-center gap-1 text-muted-foreground">
                                                        <Mail className="h-3 w-3" /> {cliente.email}
                                                    </div>
                                                )}
                                                {cliente.telefone && (
                                                    <div className="text-xs flex items-center gap-1 text-muted-foreground">
                                                        <Phone className="h-3 w-3" /> {cliente.telefone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={cliente.activo ? 'outline' : 'secondary'} className={cn("rounded-full font-normal", cliente.activo && "bg-emerald-50 text-emerald-700 border-emerald-100")}>
                                                {cliente.activo ? 'Activo' : 'Inactivo'}
                                            </Badge>
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
                                                    onClick={() => handleDelete(cliente.id)}
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
