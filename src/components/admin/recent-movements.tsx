// COMPONENTE DE MOVIMENTAÇÕES RECENTES
//
// Propósito:
// Este componente exibe uma lista das últimas transações financeiras (entradas e saídas)
// e permite ao usuário filtrar essas movimentações por descrição e período.
//
// Responsabilidade:
// - Receber a lista de movimentações (`movements`) como prop.
// - Gerenciar o estado dos filtros (termo de busca, período de data).
// - Filtrar a lista de movimentações com base nos filtros aplicados.
// - Renderizar uma tabela com as movimentações filtradas.
// - Exibir um diálogo com os detalhes de uma movimentação quando o usuário
//   dá um duplo clique em uma linha da tabela.

"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Search, ArrowRight, Info } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import type { FinancialMovement } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider, Tooltip as UITooltip, TooltipTrigger, TooltipContent as UITooltipContent } from "@/components/ui/tooltip";


export function RecentMovements({ movements }: { movements: FinancialMovement[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedMovement, setSelectedMovement] = useState<FinancialMovement | null>(null);

  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      const movementDate = new Date(movement.date);
      const matchesSearch = movement.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesDate = true;
      if (dateRange?.from) {
        matchesDate = movementDate >= dateRange.from;
      }
      if (dateRange?.to) {
        matchesDate = matchesDate && movementDate <= dateRange.to;
      }
      
      return matchesSearch && matchesDate;
    });
  }, [movements, searchTerm, dateRange]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Movimentações Recentes</CardTitle>
             <TooltipProvider>
                <UITooltip>
                    <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </TooltipTrigger>
                    <UITooltipContent>
                        <p className="max-w-xs">Histórico de todas as entradas e saídas financeiras registradas no caixa, com filtros por data e descrição.</p>
                    </UITooltipContent>
                </UITooltip>
            </TooltipProvider>
          </div>
          <CardDescription>
            Últimas movimentações financeiras registradas. Clique duas vezes para ver detalhes.
          </CardDescription>
          <div className="flex flex-col md:flex-row gap-4 mt-2">
              <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                      placeholder="Buscar por descrição..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
              <Popover>
                  <PopoverTrigger asChild>
                  <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                      "w-full md:w-[300px] justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                      )}
                  >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                      dateRange.to ? (
                          <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                          </>
                      ) : (
                          format(dateRange.from, "LLL dd, y")
                      )
                      ) : (
                      <span>Escolha um período</span>
                      )}
                  </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                  />
                  </PopoverContent>
              </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[350px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((movement) => (
                  <TableRow 
                    key={movement.id} 
                    onDoubleClick={() => setSelectedMovement(movement)}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <div className="font-medium">{movement.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(movement.date).toLocaleDateString("pt-BR")} - {" "}
                        {new Date(movement.date).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        - {movement.method}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant={movement.type === "income" ? "default" : "destructive"}
                        className={cn(
                          movement.type === "income" &&
                            "bg-emerald-500/80 text-white border-transparent hover:bg-emerald-500",
                          movement.type === "expense" &&
                            "bg-red-500/80 text-white border-transparent hover:bg-red-500"
                        )}
                      >
                        {movement.category}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        movement.type === "income"
                          ? "text-emerald-600"
                          : "text-red-600"
                      )}
                    >
                      {movement.value.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" size="sm" disabled>
            Ver Relatório Completo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={!!selectedMovement} onOpenChange={(isOpen) => !isOpen && setSelectedMovement(null)}>
        {selectedMovement && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes da Movimentação</DialogTitle>
              <DialogDescription>ID: {selectedMovement.id}</DialogDescription>
            </DialogHeader>
            <Separator />
            <div className="grid gap-4 py-4 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Data e Hora:</span>
                    <span className="font-medium">{new Date(selectedMovement.date).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Descrição:</span>
                    <span className="font-medium text-right">{selectedMovement.description}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                     <Badge
                        variant={selectedMovement.type === "income" ? "default" : "destructive"}
                        className={cn(
                          "capitalize",
                          selectedMovement.type === "income" && "bg-emerald-500/80 text-white border-transparent hover:bg-emerald-500",
                          selectedMovement.type === "expense" && "bg-red-500/80 text-white border-transparent hover:bg-red-500"
                        )}
                      >
                       {selectedMovement.type === 'income' ? 'Entrada' : 'Saída'}
                      </Badge>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Categoria:</span>
                    <span className="font-medium">{selectedMovement.category}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Método:</span>
                    <span className="font-medium">{selectedMovement.method}</span>
                </div>
                 <Separator />
                 <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Valor:</span>
                    <span className={cn(
                      "text-lg font-bold",
                      selectedMovement.type === "income" ? "text-emerald-600" : "text-red-600"
                    )}>
                      {selectedMovement.value.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                </div>
            </div>
             <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Fechar</Button>
                </DialogClose>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
