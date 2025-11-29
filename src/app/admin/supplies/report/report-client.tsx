"use client";

import { useState, useMemo, useEffect } from "react";
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, Timestamp } from 'firebase/firestore';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Loader } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Supply } from "@/types";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';

export function SuppliesReportClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"active" | "archived" | "all">("all");
  
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  
  const suppliesCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'supplies'));
  }, [firestore, user]);

  const { data: supplies, isLoading } = useCollection<Supply>(suppliesCollection);

  const filteredSupplies = useMemo(() => {
    if (!supplies) return [];
    return supplies.filter(s => {
        const isItemActive = s.isActive !== false;
        let matchesViewMode = true;
        if (viewMode === 'active') {
            matchesViewMode = isItemActive;
        } else if (viewMode === 'archived') {
            matchesViewMode = !isItemActive;
        }
        
        const matchesSearch = 
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.sku && s.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (s.supplier && s.supplier.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesViewMode && matchesSearch;
    });
  }, [supplies, searchTerm, viewMode]);

  const showLoading = isUserLoading || (isLoading && !supplies);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle>Todos os Insumos</CardTitle>
                <CardDescription>Filtre e analise os dados detalhados do seu estoque.</CardDescription>
            </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full sm:flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nome, SKU ou fornecedor..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={viewMode} onValueChange={(value: "active" | "archived" | "all") => setViewMode(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Ver status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Ver Todos</SelectItem>
                    <SelectItem value="active">Ver Ativos</SelectItem>
                    <SelectItem value="archived">Ver Arquivados</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent>
        {showLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead>Est. Mín.</TableHead>
                        <TableHead>Custo/Un.</TableHead>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>Última Compra</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredSupplies && filteredSupplies.map((supply) => (
                    <TableRow key={supply.id}>
                        <TableCell className="font-medium">{supply.name}</TableCell>
                        <TableCell className="text-muted-foreground">{supply.sku || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={supply.minStock != null && supply.stock < supply.minStock ? "destructive" : "secondary"}>
                              {supply.stock} {supply.unit}
                          </Badge>
                        </TableCell>
                         <TableCell>
                          {supply.minStock || 0} {supply.unit}
                        </TableCell>
                        <TableCell>
                          {supply.costPerUnit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                         <TableCell>{supply.supplier || 'N/A'}</TableCell>
                         <TableCell>
                            {supply.lastPurchaseDate instanceof Timestamp ? format(supply.lastPurchaseDate.toDate(), "dd/MM/yy") : 'N/A'}
                        </TableCell>
                         <TableCell>
                          <Badge variant={supply.isActive !== false ? "default" : "outline"} className={cn("text-xs", supply.isActive !== false && "bg-emerald-500 hover:bg-emerald-600")}>
                            {supply.isActive !== false ? "Ativo" : "Arquivado"}
                          </Badge>
                        </TableCell>
                    </TableRow>
                    ))}
                    {filteredSupplies.length === 0 && <TableRow><TableCell colSpan={8} className="text-center h-24">Nenhum insumo encontrado para os filtros aplicados.</TableCell></TableRow>}
                </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
