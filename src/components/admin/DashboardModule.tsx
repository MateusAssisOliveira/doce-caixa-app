
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const salesData = [
  { name: 'Seg', vendas: 4000 },
  { name: 'Ter', vendas: 3000 },
  { name: 'Qua', vendas: 2000 },
  { name: 'Qui', vendas: 2780 },
  { name: 'Sex', vendas: 1890 },
  { name: 'Sáb', vendas: 2390 },
  { name: 'Dom', vendas: 3490 },
];

const topProductsData = [
  { name: 'Bolo de Chocolate', value: 400 },
  { name: 'Torta de Limão', value: 300 },
  { name: 'Brigadeiro', value: 300 },
  { name: 'Red Velvet', value: 200 },
  { name: 'Coxinha', value: 150 },
];

const COLORS = ['#5D4037', '#8D6E63', '#BCAAA4', '#D7CCC8', '#EFEBE9'];

const recentOrders = [
  { id: 'PED-1024', cliente: 'Ana Silva', valor: 'R$ 150,00', status: 'Entregue' },
  { id: 'PED-1023', cliente: 'Roberto Gomes', valor: 'R$ 85,50', status: 'Em Preparo' },
  { id: 'PED-1022', cliente: 'Carla Dias', valor: 'R$ 210,00', status: 'Pendente' },
  { id: 'PED-1021', cliente: 'Marcos Paulo', valor: 'R$ 45,00', status: 'Cancelado' },
  { id: 'PED-1020', cliente: 'Julia Costa', valor: 'R$ 120,00', status: 'Pronto' },
];

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'Entregue': return 'success';
    case 'Pronto': return 'secondary';
    case 'Em Preparo': return 'warning';
    case 'Pendente': return 'warning';
    case 'Cancelado': return 'destructive';
    default: return 'outline';
  }
};

export const DashboardModule = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ 12.450,00</div>
          <p className="text-xs text-emerald-600 flex items-center mt-1">
            <ArrowUpRight className="h-3 w-3 mr-1" /> +12.5% vs. mês passado
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pedidos</CardTitle>
          <ShoppingBag className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">345</div>
          <p className="text-xs text-emerald-600 flex items-center mt-1">
            <ArrowUpRight className="h-3 w-3 mr-1" /> +4.2% vs. mês passado
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ 36,08</div>
          <p className="text-xs text-red-500 flex items-center mt-1">
            <ArrowDownRight className="h-3 w-3 mr-1" /> -1.1% vs. mês passado
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Lucro Líquido</CardTitle>
          <Package className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ 4.200,00</div>
          <p className="text-xs text-emerald-600 flex items-center mt-1">
            <ArrowUpRight className="h-3 w-3 mr-1" /> +8.4% vs. mês passado
          </p>
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Vendas da Semana</CardTitle>
          <p className="text-sm text-muted-foreground">Acompanhamento diário de faturamento.</p>
        </CardHeader>
        <CardContent className="pl-0">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5D4037" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#5D4037" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))' }}
                />
                <Area type="monotone" dataKey="vendas" stroke="#5D4037" strokeWidth={2} fillOpacity={1} fill="url(#colorVendas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Top Produtos</CardTitle>
          <p className="text-sm text-muted-foreground">Os queridinhos dos clientes.</p>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topProductsData}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {topProductsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-2">
            {topProductsData.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: COLORS[idx] }}></div>
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-semibold">{Math.round(item.value / 10)}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>

    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pedidos Recentes</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">5 pedidos registrados hoje.</p>
        </div>
        <Button variant="outline" size="sm">Ver tudo</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase border-b">
              <tr>
                <th className="py-3 font-medium">ID</th>
                <th className="py-3 font-medium">Cliente</th>
                <th className="py-3 font-medium">Valor</th>
                <th className="py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.map((order) => (
                <tr key={order.id} className="group hover:bg-muted/50 transition-colors">
                  <td className="py-3 font-medium text-foreground">{order.id}</td>
                  <td className="py-3 text-muted-foreground">{order.cliente}</td>
                  <td className="py-3 font-medium">{order.valor}</td>
                  <td className="py-3">
                    <Badge variant={getStatusBadgeVariant(order.status) as any}>{order.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);
