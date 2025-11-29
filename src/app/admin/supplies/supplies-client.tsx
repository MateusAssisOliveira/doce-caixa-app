"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, Timestamp } from 'firebase/firestore';
import Papa from 'papaparse';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Search, Loader, Pencil, ArchiveRestore, Eye, FileText, ArrowRight, Upload, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { addSuppliesInBatch, addSupply, updateSupply, inactivateSupply, reactivateSupply } from "@/services";
import type { Supply } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";


export function SuppliesClient() {
  const [selectedSupplyId, setSelectedSupplyId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [supplyToEdit, setSupplyToEdit] = useState<Supply | null>(null);
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");
  const { toast } = useToast();

  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  
  const suppliesCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'supplies'));
  }, [firestore, user]);

  const { data: supplies, isLoading } = useCollection<Supply>(suppliesCollection);

  useEffect(() => {
    if(supplies) {
      console.info("--- DEBUG: Dados de insumos recebidos do Firebase:", supplies);
    }
  }, [supplies]);

  const filteredSupplies = useMemo(() => {
    if (!supplies) {
      console.info("--- DEBUG: Filtrando... Nenhum insumo para exibir.");
      return [];
    }
    const result = supplies.filter(s => {
        const isItemActive = s.isActive !== false;
        const matchesViewMode = viewMode === 'active' ? isItemActive : !isItemActive;
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesViewMode && matchesSearch;
    });
    console.info(`--- DEBUG: Filtragem concluída para [${viewMode}]. Mostrando ${result.length} de ${supplies.length} insumos.`);
    return result;
  }, [supplies, searchTerm, viewMode]);
  
  const selectedSupply = useMemo(() => {
      return supplies?.find(s => s.id === selectedSupplyId) || null;
  }, [supplies, selectedSupplyId]);

  useEffect(() => {
    setSelectedSupplyId(null);
  }, [viewMode]);
  
  const handleOpenFormDialog = (supply: Supply | null) => {
    console.info("--- DEBUG: Abrindo diálogo de formulário para:", supply);
    setSupplyToEdit(supply);
    setIsFormDialogOpen(true);
  }

  const handleCloseFormDialog = () => {
    setSupplyToEdit(null);
    setIsFormDialogOpen(false);
  }
  
  const handleSaveSupply = (formData: Omit<Supply, 'id' | 'createdAt' | 'isActive'>) => {
    if (!firestore || !user) return;
    try {
        if (supplyToEdit) {
            updateSupply(firestore, supplyToEdit.id, formData);
            toast({ title: "Insumo Atualizado!" });
        } else {
            addSupply(firestore, formData);
            toast({ title: "Insumo Adicionado!" });
        }
        handleCloseFormDialog();
    } catch(e: any) {
        toast({ variant: "destructive", title: "Erro ao salvar", description: e.message });
    }
  };
  
  const handleConfirmAction = useCallback(() => {
    if (!selectedSupply || !firestore) return;
    
    if (viewMode === 'active') {
      console.info("--- DEBUG: Service: Chamando inactivateSupply para:", selectedSupply.id);
      inactivateSupply(firestore, selectedSupply.id);
      toast({ title: "Insumo Arquivado" });
    } else {
      console.info("--- DEBUG: Service: Chamando reactivateSupply para:", selectedSupply.id);
      reactivateSupply(firestore, selectedSupply.id);
      toast({ title: "Insumo Reativado" });
    }
    setSelectedSupplyId(null);
    setIsConfirmDialogOpen(false);
  }, [selectedSupply, firestore, viewMode, toast]);

  const showLoading = isUserLoading || (isLoading && !supplies);
  
  const onImportSuccess = () => {
    setIsImportDialogOpen(false);
    toast({ title: "Importação bem-sucedida!", description: "Seus insumos foram adicionados ao estoque." });
  };


  return (
    <>
      <Card className="w-full">
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <CardTitle>Estoque de Insumos</CardTitle>
                    <CardDescription>Clique em uma linha para selecionar e gerenciar.</CardDescription>
                </div>
                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                    <Button onClick={() => handleOpenFormDialog(null)} className="w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4" />Adicionar</Button>
                    <Button variant="outline" onClick={() => setIsImportDialogOpen(true)} className="w-full sm:w-auto"><Upload className="mr-2 h-4 w-4" />Importar via CSV</Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        if (selectedSupply) {
                            console.info("--- DEBUG: Botão Arquivar/Reativar clicado para:", selectedSupply.name);
                            setIsConfirmDialogOpen(true);
                        } else {
                            console.info("--- DEBUG: Botão Arquivar/Reativar clicado, mas nenhum insumo selecionado.");
                        }
                      }}
                      disabled={!selectedSupply} 
                      className="w-full sm:w-auto"
                      >
                        {viewMode === 'active' ? <><Trash2 className="mr-2 h-4 w-4" />Arquivar</> : <><ArchiveRestore className="mr-2 h-4 w-4" />Reativar</>}
                    </Button>
                </div>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
                <div className="relative w-full sm:flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar insumo..."
                        className="pl-8 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={viewMode} onValueChange={(value: "active" | "archived") => setViewMode(value)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Ver status" />
                    </SelectTrigger>
                    <SelectContent>
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
            <ScrollArea className="h-[60vh]">
              <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead>Custo/Un.</TableHead>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSupplies && filteredSupplies.map((supply) => (
                        <TableRow 
                            key={supply.id} 
                            data-state={selectedSupplyId === supply.id ? 'selected' : ''}
                            onClick={() => setSelectedSupplyId(supply.id)}
                            className="cursor-pointer"
                        >
                            <TableCell className="font-medium">{supply.name}</TableCell>
                            <TableCell>
                              <Badge variant={supply.minStock != null && supply.stock < supply.minStock ? "destructive" : "secondary"}>
                                  {supply.stock} {supply.unit}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {supply.costPerUnit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{supply.supplier || 'N/A'}</TableCell>
                             <TableCell>
                              <Badge variant={supply.isActive !== false ? "default" : "outline"} className={cn(supply.isActive !== false && "bg-emerald-500 hover:bg-emerald-600")}>
                                {supply.isActive !== false ? "Ativo" : "Arquivado"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                               <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setIsDetailsSheetOpen(true); setSelectedSupplyId(supply.id); }} title="Ver Detalhes">
                                 <Eye className="h-4 w-4" />
                               </Button>
                               <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenFormDialog(supply); }} title="Editar Insumo">
                                 <Pencil className="h-4 w-4" />
                               </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                        {filteredSupplies.length === 0 && <TableRow><TableCell colSpan={6} className="text-center h-24">Nenhum insumo encontrado.</TableCell></TableRow>}
                    </TableBody>
                </Table>
              </div>
            </ScrollArea>
          )}
        </CardContent>
        <CardFooter className="flex justify-start border-t pt-4">
             <Button variant="outline" asChild>
                <Link href="/admin/supplies/report">
                    Ver Relatório Completo
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardFooter>
      </Card>
      
      <SupplyFormDialog 
        isOpen={isFormDialogOpen}
        onClose={handleCloseFormDialog}
        onSave={handleSaveSupply}
        supply={supplyToEdit}
      />

       <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
                {viewMode === 'active' 
                ? `Isso irá arquivar o insumo "${selectedSupply?.name}". Ele não aparecerá mais nas listas de seleção.`
                : `Isso irá reativar o insumo "${selectedSupply?.name}". Ele voltará a aparecer nas listas de seleção.`}
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => console.info("--- DEBUG: Usuário cancelou a ação.")}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
                Confirmar
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SupplyDetailsSheet 
        supply={selectedSupply}
        isOpen={isDetailsSheetOpen}
        onOpenChange={setIsDetailsSheetOpen}
      />

      <ImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onSuccess={onImportSuccess}
      />
    </>
  );
}


// --- Componente de formulário separado para maior clareza ---
type SupplyFormDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: Omit<Supply, 'id' | 'createdAt' | 'isActive'>) => void;
  supply: Supply | null;
};

function SupplyFormDialog({ isOpen, onClose, onSave, supply }: SupplyFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    stock: 0,
    unit: "un" as "kg" | "L" | "un",
    costPerUnit: 0,
    sku: "",
    supplier: "",
    minStock: 0,
    lastPurchaseDate: undefined as Date | undefined,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (supply) {
        console.info("--- DEBUG: Preenchendo formulário com dados do insumo:", supply);
        setFormData({
          name: supply.name || "",
          stock: supply.stock || 0,
          unit: supply.unit || "un",
          costPerUnit: supply.costPerUnit || 0,
          sku: supply.sku || "",
          supplier: supply.supplier || "",
          minStock: supply.minStock || 0,
          lastPurchaseDate: supply.lastPurchaseDate instanceof Timestamp ? supply.lastPurchaseDate.toDate() : undefined,
        });
      } else {
        // Reseta para um novo insumo
        console.info("--- DEBUG: Resetando formulário para novo insumo.");
        setFormData({
          name: "",
          stock: 0,
          unit: "un",
          costPerUnit: 0,
          sku: "",
          supplier: "",
          minStock: 0,
          lastPurchaseDate: undefined,
        });
      }
    }
  }, [supply, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.info("--- DEBUG: Tentando salvar formulário com dados:", formData);
    if(formData.name && formData.unit && formData.costPerUnit >= 0 && formData.stock >= 0) {
      onSave(formData);
    } else {
        toast({variant: "destructive", title: "Campos inválidos", description: "Por favor, preencha nome, unidade, custo e estoque com valores válidos."})
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{supply ? 'Editar Insumo' : 'Adicionar Novo Insumo'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="supply-name">Nome do Insumo</Label>
                    <Input id="supply-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="supply-sku">SKU / Código</Label>
                    <Input id="supply-sku" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
                </div>
            </div>
          
            <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="supply-stock">Estoque Atual</Label>
                    <Input id="supply-stock" type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })} required min="0" step="any"/>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="supply-minStock">Estoque Mínimo</Label>
                    <Input id="supply-minStock" type="number" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })} min="0" step="any"/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="supply-unit">Unidade</Label>
                     <Select value={formData.unit} onValueChange={(value: "kg" | "L" | "un") => setFormData({ ...formData, unit: value })}>
                        <SelectTrigger id="supply-unit">
                            <SelectValue placeholder="Unidade" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="un">un (unidade)</SelectItem>
                            <SelectItem value="kg">kg (kilograma)</SelectItem>
                            <SelectItem value="L">L (litro)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="supply-cost">Custo por Unidade</Label>
                    <Input id="supply-cost" type="number" value={formData.costPerUnit} onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) || 0 })} required step="0.01" min="0" />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="supply-supplier">Fornecedor</Label>
                    <Input id="supply-supplier" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} />
                </div>
            </div>
            
             <div className="grid gap-2">
                <Label htmlFor="last-purchase-date">Data da Última Compra</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("justify-start text-left font-normal", !formData.lastPurchaseDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.lastPurchaseDate ? format(formData.lastPurchaseDate, "PPP") : <span>Escolha uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.lastPurchaseDate}
                      onSelect={(date) => date && setFormData({...formData, lastPurchaseDate: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
            </div>
            
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// --- Componente para exibir detalhes do insumo ---
type SupplyDetailsSheetProps = {
  supply: Supply | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

function SupplyDetailsSheet({ supply, isOpen, onOpenChange }: SupplyDetailsSheetProps) {
  if (!supply) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{supply.name}</SheetTitle>
          <SheetDescription>
            Detalhes completos do insumo. SKU: {supply.sku || "Não informado"}
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={supply.isActive !== false ? "default" : "outline"} className={cn(supply.isActive !== false && "bg-emerald-500 hover:bg-emerald-600")}>
              {supply.isActive !== false ? "Ativo" : "Arquivado"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fornecedor</span>
            <span className="font-medium">{supply.supplier || "Não informado"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Última Compra</span>
            <span className="font-medium">
              {supply.lastPurchaseDate instanceof Timestamp ? format(supply.lastPurchaseDate.toDate(), "dd/MM/yyyy") : "Não informada"}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estoque Atual</span>
            <span className="font-medium">{supply.stock} {supply.unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estoque Mínimo</span>
            <span className="font-medium">{supply.minStock != null ? `${supply.minStock} ${supply.unit}`: 'Não definido'}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Custo por Unidade</span>
            <span className="font-bold text-lg">{supply.costPerUnit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          </div>
        </div>
         <SheetFooter className="mt-6">
          <SheetClose asChild>
            <Button type="submit" variant="outline">Fechar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// --- Componente para importação de CSV ---
type ImportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function ImportDialog({ isOpen, onClose, onSuccess }: ImportDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDownloadTemplate = () => {
    const header = "nome,estoque_atual,unidade,custo_unitario,sku,estoque_minimo,fornecedor,data_ultima_compra\n";
    const example = "Açúcar,5000,kg,5.50,SKU-ACUCAR-01,1000,Fornecedor Docesul,2024-07-31\n";
    const csvContent = "\uFEFF" + header + example;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "modelo_importacao_insumos.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleImport = () => {
    if (!selectedFile || !firestore) {
      toast({ variant: 'destructive', title: 'Nenhum arquivo selecionado', description: 'Por favor, escolha um arquivo CSV para importar.' });
      return;
    }
    
    setIsProcessing(true);

    const reader = new FileReader();
    
    reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text !== 'string') {
            toast({ variant: 'destructive', title: 'Erro de Leitura', description: 'Não foi possível ler o conteúdo do arquivo.' });
            setIsProcessing(false);
            return;
        }

        Papa.parse<any>(text, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            const suppliesToImport: Omit<Supply, 'id' | 'createdAt' | 'isActive'>[] = [];
            
            for (const [index, row] of results.data.entries()) {
              if (!row.nome || !row.unidade || !row.estoque_atual || !row.custo_unitario) {
                  toast({ variant: 'destructive', title: `Erro na linha ${index + 2}`, description: 'As colunas "nome", "unidade", "estoque_atual" e "custo_unitario" são obrigatórias.' });
                  setIsProcessing(false);
                  return;
              }

              suppliesToImport.push({
                  name: row.nome,
                  stock: parseFloat(row.estoque_atual) || 0,
                  unit: row.unidade as any,
                  costPerUnit: parseFloat(row.custo_unitario.replace(',', '.')) || 0,
                  sku: row.sku || "",
                  minStock: row.estoque_minimo ? parseFloat(row.estoque_minimo.replace(',', '.')) : 0,
                  supplier: row.fornecedor || "",
                  lastPurchaseDate: row.data_ultima_compra ? new Date(row.data_ultima_compra) : undefined,
              });
            }
            
            try {
              await addSuppliesInBatch(firestore, suppliesToImport);
              onSuccess();
            } catch (error: any) {
              console.error("Erro ao importar em massa:", error);
              toast({ variant: 'destructive', title: 'Erro na importação', description: `Ocorreu um erro ao salvar os dados. Detalhe: ${error.message}` });
            } finally {
              setIsProcessing(false);
              setSelectedFile(null);
            }
          },
          error: (error) => {
            console.error("Erro ao parsear CSV:", error);
            toast({ variant: 'destructive', title: 'Erro no arquivo', description: `Não foi possível ler o arquivo CSV. Detalhe: ${error.message}` });
            setIsProcessing(false);
          }
        });
    };

    reader.onerror = () => {
        toast({ variant: 'destructive', title: 'Erro de Leitura', description: 'Ocorreu um erro ao tentar ler o arquivo.' });
        setIsProcessing(false);
    };

    reader.readAsText(selectedFile, 'windows-1252');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) { onClose(); setSelectedFile(null); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Insumos em Massa</DialogTitle>
          <DialogDescription>
            Adicione múltiplos insumos de uma vez usando um arquivo CSV.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2 p-4 border rounded-md bg-muted/50">
            <h4 className="font-semibold">Passo 1: Baixe o modelo</h4>
            <p className="text-sm text-muted-foreground">
              Use nosso modelo para garantir que seu arquivo esteja no formato correto.
            </p>
            <Button onClick={handleDownloadTemplate} variant="secondary" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Baixar Modelo (.csv)
            </Button>
          </div>

          <div className="space-y-2 p-4 border rounded-md bg-muted/50">
            <h4 className="font-semibold">Passo 2: Escolha o arquivo</h4>
            <p className="text-sm text-muted-foreground">
              Selecione o arquivo CSV que você preencheu.
            </p>
            <Input 
              type="file" 
              accept=".csv"
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {selectedFile && <p className="text-xs text-muted-foreground pt-2">Arquivo selecionado: {selectedFile.name}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onClose(); setSelectedFile(null); }} disabled={isProcessing}>Cancelar</Button>
          <Button onClick={handleImport} disabled={!selectedFile || isProcessing}>
              {isProcessing ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {isProcessing ? 'Processando...' : 'Importar Arquivo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
