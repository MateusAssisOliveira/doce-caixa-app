
'use client';

import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Package, 
  Edit3, 
  Trash2 
} from 'lucide-react';

const productsList = [
  { id: 1, nome: 'Bolo de Chocolate', categoria: 'Bolos', preco: 'R$ 85,00', estoque: 12, status: 'Ativo' },
  { id: 2, nome: 'Torta de Limão', categoria: 'Doces', preco: 'R$ 65,00', estoque: 5, status: 'Ativo' },
  { id: 3, nome: 'Café Expresso', categoria: 'Bebidas', preco: 'R$ 8,00', estoque: 100, status: 'Ativo' },
  { id: 4, nome: 'Croissant', categoria: 'Salgados', preco: 'R$ 12,00', estoque: 0, status: 'Inativo' },
  { id: 5, nome: 'Macarons (cx)', categoria: 'Doces', preco: 'R$ 45,00', estoque: 20, status: 'Ativo' },
];

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'Ativo': return 'success';
    case 'Inativo': return 'outline';
    default: return 'outline';
  }
};

export const ProductsModule = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Catálogo</h2>
        <p className="text-muted-foreground">Gerencie seus produtos e estoque.</p>
      </div>
      <Button>
        <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
      </Button>
    </div>

    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
            <tr>
              <th className="h-12 px-4 align-middle font-medium w-[80px]">Img</th>
              <th className="h-12 px-4 align-middle font-medium">Produto</th>
              <th className="h-12 px-4 align-middle font-medium">Categoria</th>
              <th className="h-12 px-4 align-middle font-medium">Preço</th>
              <th className="h-12 px-4 align-middle font-medium">Estoque</th>
              <th className="h-12 px-4 align-middle font-medium">Status</th>
              <th className="h-12 px-4 align-middle font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {productsList.map((product) => (
              <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                </td>
                <td className="p-4 font-medium text-foreground">{product.nome}</td>
                <td className="p-4">
                  <Badge variant="secondary" className="font-normal">{product.categoria}</Badge>
                </td>
                <td className="p-4 font-medium">{product.preco}</td>
                <td className="p-4">
                   <div className="flex items-center gap-2">
                     <span className={`text-xs ${product.estoque === 0 ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                       {product.estoque === 0 ? 'Esgotado' : `${product.estoque} un`}
                     </span>
                     {product.estoque > 0 && (
                        <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: '60%' }}></div>
                        </div>
                     )}
                   </div>
                </td>
                <td className="p-4">
                  <Badge variant={getStatusBadgeVariant(product.status) as any}>{product.status}</Badge>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);
