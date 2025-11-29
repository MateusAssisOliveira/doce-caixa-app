// COMPONENTE DE CARD DE MÉTRICA
//
// Propósito:
// Este componente exibe uma métrica individual no dashboard, como "Vendas Hoje"
// ou "Ticket Médio".
//
// Responsabilidade:
// - Receber as propriedades de uma métrica (título, valor, tendência, etc.) via props.
// - Renderizar um `Card` com as informações formatadas.
// - Exibir um ícone de seta para cima ou para baixo para indicar a direção da tendência
//   (positiva ou negativa).
// - Apresentar um `Tooltip` com a descrição da métrica quando o usuário passa o mouse
//   sobre o ícone de informação.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { DashboardMetric } from "@/types";
import { ArrowDown, ArrowUp, Info } from "lucide-react";

export function MetricCard({ title, value, trend, trendDirection, description }: DashboardMetric) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {title}
          {description && (
             <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p
            className={cn(
              "text-xs text-muted-foreground flex items-center",
              trendDirection === "positive" ? "text-emerald-500" : "text-red-500"
            )}
          >
            {trendDirection === "positive" ? (
              <ArrowUp className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDown className="h-4 w-4 mr-1" />
            )}
            {trend} vs ontem
          </p>
        )}
      </CardContent>
    </Card>
  );
}
