// COMPONENTE DE CONTROLE DE CAIXA
//
// Propósito:
// Este componente renderiza os botões e diálogos para gerenciar o fluxo de caixa,
// como registrar entradas e saídas de dinheiro.
//
// Responsabilidade:
// - Apresentar a interface para ações rápidas de caixa.
// - Abrir diálogos (modais) para o usuário inserir informações sobre
//   entradas (vendas manuais, aportes) e saídas (despesas, pagamentos).
// - Atualmente, a lógica de salvar os dados não está implementada, servindo
//   como uma estrutura visual.

"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, MinusCircle, Info } from "lucide-react";
import { TooltipProvider, Tooltip as UITooltip, TooltipTrigger, TooltipContent as UITooltipContent } from "@/components/ui/tooltip";

export function CashControl() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <CardTitle>Controle de Caixa</CardTitle>
            <TooltipProvider>
                <UITooltip>
                    <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </TooltipTrigger>
                    <UITooltipContent>
                        <p className="max-w-xs">Gerencie o fluxo do seu caixa. Registre entradas (vendas manuais, aportes) e saídas (pagamentos, despesas) de forma rápida.</p>
                    </UITooltipContent>
                </UITooltip>
            </TooltipProvider>
        </div>
        <CardDescription>Abertura, fechamento e registro de movimentações.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button className="w-full">Abrir/Fechar Caixa</Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4 text-emerald-500" />
              Registrar Entrada
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Entrada</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="income-value">Valor</Label>
                    <Input id="income-value" type="number" placeholder="R$ 0,00" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="income-desc">Descrição</Label>
                    <Input id="income-desc" placeholder="Ex: Venda balcão" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="income-category">Categoria</Label>
                    <Select>
                        <SelectTrigger id="income-category">
                            <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="venda-balcao">Venda Balcão</SelectItem>
                            <SelectItem value="pedido-online">Pedido Online</SelectItem>
                            <SelectItem value="encomenda-evento">Encomenda/Evento</SelectItem>
                            <SelectItem value="outros">Outras Entradas</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="submit">Salvar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <MinusCircle className="mr-2 h-4 w-4 text-red-500" />
              Registrar Saída
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Saída</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="expense-value">Valor</Label>
                    <Input id="expense-value" type="number" placeholder="R$ 0,00" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="expense-desc">Descrição</Label>
                    <Input id="expense-desc" placeholder="Ex: Pagamento fornecedor" />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="expense-category">Categoria</Label>
                    <Select>
                        <SelectTrigger id="expense-category">
                            <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fornecedor">Fornecedor</SelectItem>
                            <SelectItem value="insumos">Insumos</SelectItem>
                            <SelectItem value="despesa">Despesa Fixa</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
               <DialogClose asChild>
                <Button type="submit">Salvar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </CardContent>
    </Card>
  );
}
