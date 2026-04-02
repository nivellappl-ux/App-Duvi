'use client'
import { useState, useEffect } from 'react'
import {
    Users,
    FileText,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Package
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getDashboardStats } from '@/lib/actions/dashboard.actions'
import { formatAOA } from '@/lib/angola/moeda'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { BarChart3 } from 'lucide-react'

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadStats = async () => {
            const data = await getDashboardStats()
            setStats(data)
            setLoading(false)
        }
        loadStats()
    }, [])

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando métricas da empresa...</div>
    }

    const cards = [
        {
            title: 'Faturação Total',
            value: formatAOA(stats?.totalEmitido || 0),
            icon: TrendingUp,
            trend: '+12.5%',
            trendUp: true,
            description: 'Total acumulado este ano',
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            title: 'Total Cobrado',
            value: formatAOA(stats?.totalPago || 0),
            icon: CheckCircle,
            trend: '+8.2%',
            trendUp: true,
            description: 'Receitas confirmadas',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            title: 'Valor Pendente',
            value: formatAOA(stats?.totalPendente || 0),
            icon: Clock,
            trend: '-2.4%',
            trendUp: false,
            description: `${stats?.faturasPendentes || 0} faturas por liquidar`,
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
        {
            title: 'Clientes Activos',
            value: stats?.numClientes || 0,
            icon: Users,
            trend: '+5',
            trendUp: true,
            description: 'Clientes registados',
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        }
    ]

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-1">Bem-vindo à gestão centralizada da sua empresa em Angola.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {cards.map((card, i) => (
                    <Card key={i} className="border-none shadow-md shadow-slate-100 hover:shadow-lg transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                {card.title}
                            </CardTitle>
                            <div className={`${card.bg} ${card.color} p-2 rounded-lg`}>
                                <card.icon className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-slate-900">{card.value}</div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={cn(
                                    "flex items-center text-xs font-bold px-1.5 py-0.5 rounded-full",
                                    card.trendUp ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                )}>
                                    {card.trendUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                                    {card.trend}
                                </span>
                                <p className="text-xs text-slate-400 font-medium">{card.description}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4 border-none shadow-md shadow-slate-100 h-[400px] flex items-center justify-center p-10 bg-slate-50 border-2 border-dashed border-slate-200">
                    <div className="text-center space-y-3">
                        <BarChart3 className="h-12 w-12 text-slate-300 mx-auto" />
                        <h3 className="font-bold text-slate-400">Gráfico de Performance</h3>
                        <p className="text-xs text-slate-400 max-w-[200px]">Os gráficos de vendas serão ativados após as primeiras {10 - (stats?.numClientes || 0)} transações reais.</p>
                    </div>
                </Card>

                <Card className="lg:col-span-3 border-none shadow-md shadow-slate-100">
                    <CardHeader>
                        <CardTitle className="text-base font-bold">Estado do Inventário</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                                    <Package className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-slate-700">{stats?.numProdutos || 0} Produtos</div>
                                    <div className="text-xs text-slate-400">Catálogo total de itens</div>
                                </div>
                                <Link href="/produtos">
                                    <Button variant="ghost" size="sm" className="text-blue-600">Ver todos</Button>
                                </Link>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Alertas Rápidos</h4>
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 text-amber-800 border border-amber-100 text-sm">
                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>Existem produtos com <strong>stock baixo</strong>. Verifique o módulo de inventário para reposição.</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
