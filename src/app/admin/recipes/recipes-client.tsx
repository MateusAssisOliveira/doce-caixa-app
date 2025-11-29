"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Search, BookMarked, Edit, Trash, Loader, ArchiveRestore } from "lucide-react";
import { addTechnicalSheet, updateTechnicalSheet, inactivateTechnicalSheet, reactivateTechnicalSheet } from "@/services";
import type { Supply, TechnicalSheet, TechnicalSheetComponent } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, query } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type RecipeItem = {
  supply: Supply;
  quantity: number;
};

type RecipesClientProps = {
    supplies: Supply[];
};

export function RecipesClient({ supplies }: RecipesClientProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  
  const sheetsCollection = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return query(collection(firestore, 'technical_sheets'));
  }, [firestore, user]);

  const { data: savedSheets, isLoading: areSheetsLoading } = useCollection<TechnicalSheet>(sheetsCollection);

  const [activeTab, setActiveTab] = useState<'new-recipe' | 'manage-recipes'>('new-recipe');
  const [sheetToEdit, setSheetToEdit] = useState<TechnicalSheet | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = (sheet: TechnicalSheet | null) => {
    setSheetToEdit(sheet);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSheetToEdit(null);
    setIsDialogOpen(false);
  };
  
  return (
    <>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new-recipe">Nova Ficha Técnica</TabsTrigger>
          <TabsTrigger value="manage-recipes">Gerenciar Fichas</TabsTrigger>
        </TabsList>
        <TabsContent value="new-recipe">
          <NewRecipeForm supplies={supplies} savedSheets={savedSheets || []} />
        </TabsContent>
        <TabsContent value="manage-recipes">
          <RecipesList 
            isLoading={areSheetsLoading}
            recipes={savedSheets || []}
            onEditRecipe={handleOpenDialog}
          />
        </TabsContent>
      </Tabs>
       <RecipeFormDialog 
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        recipe={sheetToEdit}
        supplies={supplies}
        savedSheets={savedSheets || []}
       />
    </>
  );
}

// --- Componente para listar receitas ---
type RecipesListProps = {
    isLoading: boolean;
    recipes: TechnicalSheet[];
    onEditRecipe: (recipe: TechnicalSheet) => void;
}

function RecipesList({ isLoading, recipes, onEditRecipe }: RecipesListProps) {
    const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();

     useEffect(() => {
      if(recipes) {
        console.info("--- DEBUG: Dados de fichas recebidos do Firebase:", recipes);
      }
    }, [recipes]);


    const filteredRecipes = useMemo(() => {
      if (!recipes) {
         console.info("--- DEBUG: Filtrando... Nenhuma ficha para exibir.");
         return [];
      }
      const result = recipes.filter(recipe => {
          const isRecipeActive = recipe.isActive !== false;
          const matchesViewMode = viewMode === 'active' ? isRecipeActive : !isRecipeActive;
          return matchesViewMode;
      });
      console.info(`--- DEBUG: Filtragem de fichas concluída para [${viewMode}]. Mostrando ${result.length} de ${recipes.length}.`);
      return result;
    }, [recipes, viewMode]);

    const selectedRecipe = useMemo(() => {
        return recipes?.find(r => r.id === selectedRecipeId) || null;
    }, [recipes, selectedRecipeId]);

    useEffect(() => {
        setSelectedRecipeId(null);
    }, [viewMode]);
    
    const handleConfirmAction = () => {
        if(!selectedRecipe || !firestore) return;
        
        if (viewMode === 'active') {
          console.info("--- DEBUG: Usuário confirmou. Chamando inactivateTechnicalSheet...");
          inactivateTechnicalSheet(firestore, selectedRecipe.id);
          toast({ title: "Ficha Técnica Arquivada!" });
        } else {
          console.info("--- DEBUG: Usuário confirmou. Chamando reactivateTechnicalSheet...");
          reactivateTechnicalSheet(firestore, selectedRecipe.id);
          toast({ title: "Ficha Técnica Reativada!" });
        }
        setSelectedRecipeId(null);
        setIsConfirmDialogOpen(false);
    };

    return (
        <>
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle>Livro de Fichas Técnicas</CardTitle>
                        <CardDescription>Clique em uma ficha para selecionar e gerenciar.</CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" onClick={() => selectedRecipe && onEditRecipe(selectedRecipe)} disabled={!selectedRecipe} className="w-full sm:w-auto">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => setIsConfirmDialogOpen(true)}
                          disabled={!selectedRecipe} 
                          className="w-full sm:w-auto"
                        >
                            {viewMode === 'active' ? <><Trash className="mr-2 h-4 w-4" />Arquivar</> : <><ArchiveRestore className="mr-2 h-4 w-4" />Reativar</>}
                        </Button>
                    </div>
                </div>
                 <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
                    <Select value={viewMode} onValueChange={(value: "active" | "archived") => setViewMode(value)}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Ver status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Ver Ativas</SelectItem>
                            <SelectItem value="archived">Ver Arquivadas</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <Loader className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.map(recipe => (
                    <div key={recipe.id} onClick={() => setSelectedRecipeId(recipe.id)} className="cursor-pointer">
                      <Card 
                        data-state={selectedRecipeId === recipe.id ? 'selected' : ''}
                        className="data-[state=selected]:bg-accent data-[state=selected]:ring-2 data-[state=selected]:ring-primary h-full"
                      >
                        <CardHeader>
                            <CardTitle className="truncate">{recipe.name}</CardTitle>
                            <CardDescription className="line-clamp-2 h-10">{recipe.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Custo Total:</span>
                            <span className="font-bold">{recipe.totalCost.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                          </div>
                           <div className="flex justify-between">
                            <span className="text-muted-foreground">Preço Sugerido:</span>
                            <span className="font-bold text-primary">{recipe.suggestedPrice.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                          </div>
                           <div className="flex justify-between">
                            <span className="text-muted-foreground">Rendimento:</span>
                            <span className="font-medium">{recipe.yield}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                   {filteredRecipes.length === 0 && (
                      <p className="text-muted-foreground text-center col-span-full py-10">Nenhuma ficha técnica encontrada.</p>
                  )}
                </div>
            )}
          </CardContent>
        </Card>
        <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                    {viewMode === 'active' 
                    ? `Isso irá arquivar a ficha "${selectedRecipe?.name}".`
                    : `Isso irá reativar a ficha "${selectedRecipe?.name}".`}
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmAction}>
                    Confirmar
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    )
}

// --- Componente de Formulário para Nova Receita ---
function NewRecipeForm({ supplies, savedSheets }: { supplies: Supply[], savedSheets: TechnicalSheet[] }) {
  const [components, setComponents] = useState<TechnicalSheetComponent[]>([]);
  const [sheetName, setSheetName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [sheetYield, setSheetYield] = useState("");
  const [sheetType, setSheetType] = useState<'base' | 'final'>('base');

  const [markup, setMarkup] = useState(100);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const firestore = useFirestore();

  const filteredSupplies = useMemo(() => {
    return supplies.filter((supply) =>
      supply.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [supplies, searchTerm]);
  
  const filteredSheets = useMemo(() => {
    return savedSheets.filter((sheet) =>
      sheet.name.toLowerCase().includes(searchTerm.toLowerCase()) && sheet.type === 'base'
    );
  }, [savedSheets, searchTerm]);


  const addComponent = (item: Supply | TechnicalSheet, type: 'supply' | 'sheet') => {
    if (components.find((c) => c.componentId === item.id)) return;
    
    let unit = 'un';
    if (type === 'supply') {
      const supply = item as Supply;
      unit = supply.unit === 'kg' ? 'g' : supply.unit === 'L' ? 'ml' : 'un';
    } else {
      unit = 'g'; // Assumir 'g' como padrão para fichas, pode ser ajustado
    }

    const newComponent: TechnicalSheetComponent = {
      componentId: item.id,
      componentName: item.name,
      componentType: type,
      quantity: 0,
      unit: unit,
    };
    setComponents([...components, newComponent]);
  };

  const updateQuantity = (componentId: string, quantity: number) => {
    setComponents(
      components.map((c) =>
        c.componentId === componentId ? { ...c, quantity: quantity } : c
      )
    );
  };
  
  const removeItem = (componentId: string) => {
    setComponents(components.filter(c => c.componentId !== componentId));
  }

  const getCost = (component: TechnicalSheetComponent) => {
    let costPerBaseUnit = 0;
    
    if (component.componentType === 'supply') {
      const supply = supplies.find(s => s.id === component.componentId);
      if (!supply) return 0;
      costPerBaseUnit = supply.costPerUnit; // Custo por kg, L ou un
    } else { // 'sheet'
      const sheet = savedSheets.find(s => s.id === component.componentId);
      if (!sheet || !sheet.yield) return 0;
      
      // Tenta extrair um valor numérico do rendimento (ex: "1000g")
      const yieldAmount = parseFloat(sheet.yield.replace(/[^0-9.]/g, ''));
      if(isNaN(yieldAmount) || yieldAmount === 0) return 0;

      costPerBaseUnit = sheet.totalCost / yieldAmount; // Custo por g ou ml
    }

    let quantityInBaseUnit = component.quantity;
    // Converte g/ml para kg/L se o custo base for por kg/L
    if ((component.unit === 'g' || component.unit === 'ml') && costPerBaseUnit > 0) {
      const supply = supplies.find(s => s.id === component.componentId);
      if (supply && (supply.unit === 'kg' || supply.unit === 'L')) {
        quantityInBaseUnit = component.quantity / 1000;
      }
    }
    
    return quantityInBaseUnit * costPerBaseUnit;
  };

  const totalCost = useMemo(() => {
    return components.reduce((total, item) => total + getCost(item), 0);
  }, [components, supplies, savedSheets]);

  const suggestedPrice = useMemo(() => {
    return totalCost * (1 + markup / 100);
  }, [totalCost, markup]);
  
  const profit = useMemo(() => suggestedPrice - totalCost, [suggestedPrice, totalCost]);

  const clearForm = () => {
      setComponents([]);
      setSheetName("");
      setDescription("");
      setSteps("");
      setSheetType('base');
      setSheetYield("");
      setMarkup(100);
  }

  const handleSaveSheet = () => {
    if (!firestore) return;
    if (!sheetName.trim()) {
        toast({ variant: "destructive", title: "Nome da Ficha Inválido" });
        return;
    }
    if (components.length === 0) {
        toast({ variant: "destructive", title: "Ficha Vazia", description: "Adicione componentes à ficha." });
        return;
    }

    try {
      addTechnicalSheet(firestore, {
        name: sheetName,
        description,
        type: sheetType,
        components,
        steps,
        yield: sheetYield,
        totalCost,
        suggestedPrice
      });
      
      toast({
        title: "Ficha Técnica Salva!",
        description: `A ficha "${sheetName}" foi salva no seu livro.`,
      });
      clearForm();
    } catch (e: any) {
        toast({ variant: "destructive", title: "Erro ao Salvar Ficha", description: e.message });
    }
  };

  return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pt-6">
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Componentes Disponíveis</CardTitle>
              <div className="relative pt-2">
                <Search className="absolute left-2 top-4 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar componente..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[40rem]">
                <Label className="text-xs font-bold text-muted-foreground px-2">INSUMOS</Label>
                <Table>
                  <TableBody>
                    {filteredSupplies.map((supply) => (
                      <TableRow key={supply.id} className="cursor-pointer" onClick={() => addComponent(supply, 'supply')}>
                        <TableCell className="py-2">{supply.name}</TableCell>
                        <TableCell className="text-right py-2">
                          <Button size="icon" variant="ghost" disabled={components.some(c => c.componentId === supply.id)}>
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Label className="text-xs font-bold text-muted-foreground px-2 mt-4 block">FICHAS TÉCNICAS (BASE)</Label>
                <Table>
                  <TableBody>
                    {filteredSheets.map((sheet) => (
                      <TableRow key={sheet.id} className="cursor-pointer" onClick={() => addComponent(sheet, 'sheet')}>
                        <TableCell className="py-2">{sheet.name}</TableCell>
                        <TableCell className="text-right py-2">
                          <Button size="icon" variant="ghost" disabled={components.some(c => c.componentId === sheet.id)}>
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Nova Ficha Técnica</CardTitle>
              <CardDescription>Preencha os detalhes da sua nova ficha técnica ou montagem.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
               <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-2">
                    <Label htmlFor="sheet-name">Nome da Ficha</Label>
                    <Input id="sheet-name" placeholder="Ex: Massa de Chocolate ou Bolo de Pote" value={sheetName} onChange={(e) => setSheetName(e.target.value)} />
                  </div>
                   <div className="grid gap-2">
                      <Label htmlFor="sheet-type">Tipo de Ficha</Label>
                      <Select value={sheetType} onValueChange={(v) => setSheetType(v as any)}>
                        <SelectTrigger id="sheet-type">
                          <SelectValue placeholder="Selecione o tipo..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="base">Ficha de Base (Receita)</SelectItem>
                          <SelectItem value="final">Ficha de Montagem (Produto Final)</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>
               </div>
               <div className="grid gap-2">
                <Label htmlFor="sheet-description">Breve Descrição</Label>
                <Textarea id="sheet-description" placeholder="Uma dica ou detalhe especial sobre a ficha." value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <Label>Componentes da Ficha</Label>
                <Card className="mt-2">
                    <CardContent className="p-2">
                        <ScrollArea className="h-40">
                             <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead className="w-2/5">Componente</TableHead>
                                    <TableHead>Qtd.</TableHead>
                                    <TableHead>Un.</TableHead>
                                    <TableHead className="text-right">Custo</TableHead>
                                    <TableHead className="text-right">Ação</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {components.length > 0 ? (
                                    components.map((item) => (
                                    <TableRow key={item.componentId}>
                                        <TableCell className="font-medium py-1">{item.componentName}</TableCell>
                                        <TableCell className="py-1">
                                        <Input type="number" className="w-20 h-8" value={item.quantity} onChange={(e) => updateQuantity(item.componentId, parseFloat(e.target.value) || 0)} min="0" />
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground py-1">{item.unit}</TableCell>
                                        <TableCell className="text-right py-1">{getCost(item).toLocaleString("pt-BR", { style: "currency", currency: "BRL"})}</TableCell>
                                        <TableCell className="text-right py-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(item.componentId)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                        </TableCell>
                                    </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Adicione componentes da lista ao lado.</TableCell></TableRow>
                                )}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
              </div>
               <div className="grid gap-2">
                <Label htmlFor="sheet-steps">Modo de Preparo / Montagem</Label>
                <Textarea id="sheet-steps" placeholder="Passo 1: Misture os ingredientes secos..." value={steps} onChange={(e) => setSteps(e.target.value)} rows={5}/>
              </div>
              <div className="grid gap-2 col-span-2 md:col-span-1">
                  <Label htmlFor="sheet-yield">Rendimento Final</Label>
                  <Input id="sheet-yield" placeholder="Ex: 1200g, 10 potes, 1 bolo" value={sheetYield} onChange={e => setSheetYield(e.target.value)}/>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-6 !p-6 border-t mt-4">
                <div className="grid sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2"><Label>Custo Total</Label><p className="font-bold text-lg">{totalCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL"})}</p></div>
                    <div className="flex flex-col gap-2"><Label htmlFor="markup">Margem de Lucro (%)</Label><Input id="markup" type="number" value={markup} onChange={e => setMarkup(parseFloat(e.target.value) || 0)} placeholder="100"/></div>
                    <div className="flex flex-col gap-2"><Label>Lucro Previsto</Label><p className="font-bold text-lg text-emerald-600">{profit.toLocaleString("pt-BR", { style: "currency", currency: "BRL"})}</p></div>
                </div>
                 <div className="border-t pt-4">
                    <Label className="text-sm">Preço Final de Venda Sugerido</Label>
                    <p className="font-headline text-3xl font-bold text-primary">{suggestedPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL"})}</p>
                 </div>
                 <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                     <Button variant="outline" onClick={clearForm}>Limpar Formulário</Button>
                     <Button onClick={handleSaveSheet}><BookMarked className="mr-2 h-4 w-4"/>Salvar Ficha Técnica</Button>
                 </div>
            </CardFooter>
          </Card>
        </div>
      </div>
  );
}


// --- Componente de Diálogo para Edição ---
type RecipeFormDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  recipe: TechnicalSheet | null;
  supplies: Supply[];
  savedSheets: TechnicalSheet[];
};

function RecipeFormDialog({ isOpen, onClose, recipe, supplies, savedSheets }: RecipeFormDialogProps) {
  const [formData, setFormData] = useState<Partial<Omit<TechnicalSheet, 'id' | 'createdAt' | 'isActive'>>>({});
  const [components, setComponents] = useState<TechnicalSheetComponent[]>([]);
  const [markup, setMarkup] = useState(100);
  const { toast } = useToast();
  const firestore = useFirestore();

  useEffect(() => {
    if (recipe && supplies.length > 0) {
      setComponents(recipe.components || []);
      
      const cost = recipe.totalCost;
      const price = recipe.suggestedPrice;
      const newMarkup = cost > 0 ? ((price / cost) - 1) * 100 : 100;
      
      setMarkup(newMarkup);
      setFormData({
        name: recipe.name,
        description: recipe.description,
        type: recipe.type,
        components: recipe.components,
        steps: recipe.steps,
        yield: recipe.yield,
        totalCost: recipe.totalCost,
        suggestedPrice: recipe.suggestedPrice,
      });
    } else {
       setComponents([]);
       setMarkup(100);
       setFormData({
            name: "", description: "", type: 'base', components: [], steps: "", 
            yield: "", totalCost: 0, suggestedPrice: 0
       });
    }
  }, [recipe, supplies, isOpen]);
  
  // --- Lógica de cálculo copiada para o diálogo ---
  const getCost = (component: TechnicalSheetComponent) => {
    let costPerBaseUnit = 0;
    
    if (component.componentType === 'supply') {
      const supply = supplies.find(s => s.id === component.componentId);
      if (!supply) return 0;
      costPerBaseUnit = supply.costPerUnit; // Custo por kg, L ou un
    } else { // 'sheet'
      const sheet = savedSheets.find(s => s.id === component.componentId);
      if (!sheet || !sheet.yield) return 0;
      
      const yieldAmount = parseFloat(sheet.yield.replace(/[^0-9.]/g, ''));
      if(isNaN(yieldAmount) || yieldAmount === 0) return 0;

      costPerBaseUnit = sheet.totalCost / yieldAmount; // Custo por g ou ml
    }

    let quantityInBaseUnit = component.quantity;
    if ((component.unit === 'g' || component.unit === 'ml') && costPerBaseUnit > 0) {
        const supply = supplies.find(s => s.id === component.componentId);
        if (supply && (supply.unit === 'kg' || supply.unit === 'L')) {
            quantityInBaseUnit = component.quantity / 1000;
        }
    }
    
    return quantityInBaseUnit * costPerBaseUnit;
  };

  const totalCost = useMemo(() => {
    return components.reduce((total, item) => total + getCost(item), 0);
  }, [components, supplies, savedSheets]);

  const suggestedPrice = useMemo(() => {
    return totalCost * (1 + markup / 100);
  }, [totalCost, markup]);


  const handleUpdateRecipe = () => {
    if (!firestore || !recipe || !formData.name) return;

    try {
      updateTechnicalSheet(firestore, recipe.id, {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        components: components,
        steps: formData.steps,
        yield: formData.yield,
        totalCost: totalCost,
        suggestedPrice: suggestedPrice,
      });
      toast({ title: "Ficha Técnica Atualizada!", description: `"${formData.name}" foi atualizada.` });
      onClose();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Erro ao Atualizar", description: e.message });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar Ficha Técnica: {recipe?.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
           <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-sheet-name">Nome da Ficha</Label>
                <Input id="edit-sheet-name" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
               <div className="grid gap-2">
                  <Label htmlFor="edit-sheet-type">Tipo de Ficha</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v as any})}>
                    <SelectTrigger id="edit-sheet-type">
                      <SelectValue placeholder="Selecione o tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="base">Ficha de Base (Receita)</SelectItem>
                      <SelectItem value="final">Ficha de Montagem (Produto Final)</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
           </div>
           <div className="grid gap-2">
            <Label htmlFor="edit-sheet-description">Breve Descrição</Label>
            <Textarea id="edit-sheet-description" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="edit-sheet-steps">Modo de Preparo / Montagem</Label>
            <Textarea id="edit-sheet-steps" value={formData.steps || ''} onChange={(e) => setFormData({...formData, steps: e.target.value})} rows={5}/>
          </div>
          <div className="grid gap-2">
              <Label htmlFor="edit-sheet-yield">Rendimento</Label>
              <Input id="edit-sheet-yield" value={formData.yield || ''} onChange={e => setFormData({...formData, yield: e.target.value})}/>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 border-t pt-4">
            <div className="flex flex-col gap-2"><Label>Custo Total</Label><p className="font-bold text-lg">{totalCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL"})}</p></div>
            <div className="flex flex-col gap-2"><Label htmlFor="edit-markup">Margem de Lucro (%)</Label><Input id="edit-markup" type="number" value={markup} onChange={e => setMarkup(parseFloat(e.target.value) || 0)} placeholder="100"/></div>
            <div className="flex flex-col gap-2"><Label>Preço Sugerido</Label><p className="font-bold text-lg text-primary">{suggestedPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL"})}</p></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="button" onClick={handleUpdateRecipe}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
