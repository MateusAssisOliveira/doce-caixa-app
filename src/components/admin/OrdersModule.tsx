
'use client';

import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Calendar 
} from 'lucide-react';

const recentOrders = [
  { id: 'PED-1024', cliente: 'Ana Silva', valor: 'R$ 150,00', status: 'Entregue', data: 'Hoje, 14:30' },
  { id: 'PED-1023', cliente: 'Roberto Gomes', valor: 'R$ 85,50', status: 'Em Preparo', data: 'Hoje, 14:15' },
  { id: 'PED-1022', cliente: 'Carla Dias', valor: 'R$ 210,00', status: 'Pendente', data: 'Hoje, 14:00' },
  { id: 'PED-1021', cliente: 'Marcos Paulo', valor: 'R$ 45,00', status: 'Cancelado', data: 'Hoje, 13:45' },
  { id: 'PED-1020', cliente: 'Julia Costa', valor: 'R$ 120,00', status: 'Pronto', data: 'Hoje, 13:30' },
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

export const OrdersModule = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex gap-2 w-full md:w-auto">
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar pedido ou cliente..." className="pl-9" />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      <Button className="w-full md:w-auto">
        <Plus className="mr-2 h-4 w-4" /> Novo Pedido
      </Button>
    </div>

    <div className="w-full justify-start overflow-x-auto bg-transparent p-0 gap-2 h-auto flex">
      {['Todos', 'Pendente', 'Em Preparo', 'Pronto', 'Entregue', 'Cancelado'].map((tab) => (
        <button key={tab} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${tab === 'Todos' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:bg-muted/50'}`}>
          {tab}
        </button>
      ))}
    </div>

    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
            <tr>
              <th className="h-12 px-4 align-middle font-medium">Pedido</th>
              <th className="h-12 px-4 align-middle font-medium">Data</th>
              <th className="h-12 px-4 align-middle font-medium">Cliente</th>
              <th className="h-12 px-4 align-middle font-medium">Total</th>
              <th className="h-12 px-4 align-middle font-medium">Status</th>
              <th className="h-12 px-4 align-middle font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[...recentOrders, ...recentOrders].map((order, idx) => (
              <tr key={idx} className="hover:bg-muted/50 transition-colors">
                <td className="p-4 font-medium">{order.id}</td>
                <td className="p-4 text-muted-foreground flex items-center gap-1">
                   <Calendar className="h-3 w-3" /> {order.data.split(',')[0]}
                </td>
                <td className="p-4">{order.cliente}</td>
                <td className="p-4 font-medium">{order.valor}</td>
                <td className="p-4">
                  <Badge variant={getStatusBadgeVariant(order.status) as any}>{order.status}</Badge>
                </td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end space-x-2 p-4 border-t">
        <Button variant="outline" size="sm" disabled>Anterior</Button>
        <Button variant="outline" size="sm">Próximo</Button>
      </div>
    </Card>
  </div>
);
