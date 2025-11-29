
import { ArrowLeft, FileText } from "lucide-react";
import { SuppliesReportClient } from "./report-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminSuppliesReportPage() {
  return (
    <div className="w-full">
       <div>
        <Button variant="outline" size="sm" asChild className="mb-4">
           <Link href="/admin/supplies">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Insumos
            </Link>
        </Button>
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" /> Relatório Completo de Insumos
        </h1>
        <p className="text-muted-foreground">
          Visão geral com todos os detalhes do seu estoque de insumos.
        </p>
      </div>
      <div className="mt-8">
        <SuppliesReportClient />
      </div>
    </div>
  );
}
