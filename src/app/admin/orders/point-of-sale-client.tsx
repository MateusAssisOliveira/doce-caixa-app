"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Terminal, PlusCircle, Trash2, Search, Eye, Printer, Pencil, Loader } from "lucide-react";
import { updateOrderStatus, addOrder } from "@/services";
import type { Order, OrderStatus, Product, OrderItem } from "@/types";
import { OrderReceipt } from "@/components/admin/order-receipt";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useUser, useCollection, useFirestore, useMemoFirebase, useAuth } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";

const getStatusVariant = (status: OrderStatus) => {
  switch (status) {
    case "Pendente": return "default";
    case "Em Preparo": return "secondary";
    case "Pronto para Retirada": return "default";
    case "Entregue": return "default";
    case "Cancelado": return "destructive";
    default: return "outline";
  }
};

type PointOfSaleClientProps = {
    products: Product[];
}

export function PointOfSaleClient({ products }: PointOfSaleClientProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);
  
  const ordersQuery = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: orders, isLoading: areOrdersLoading } = useCollection<Order>(ordersQuery);

  // State for new order
  const [newOrderItems, setNewOrderItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    if (!firestore) return;
    try {
        updateOrderStatus(firestore, orderId, newStatus);
        toast({ title: "Status Atualizado!", description: `O status do pedido ${orderId} foi alterado.` });
    } catch(e: any) {
        toast({ variant: "destructive", title: "Erro", description: e.message });
    }
  };
  
  const handlePrint = () => window.print();
  
  const getEditOrderUrl = (order: Order) => `/admin/orders/edit?id=${encodeURIComponent(order.id)}`;

  // --- New Order Logic ---
  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) && product.isActive !== false
    );
  }, [products, searchTerm]);

  const addProductToOrder = (product: Product) => {
    setNewOrderItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevItems,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          price: product.price,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setNewOrderItems((prevItems) =>
        prevItems.filter((item) => item.productId !== productId)
      );
    } else {
      setNewOrderItems((prevItems) =>
        prevItems.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const newOrderTotal = useMemo(() => {
    return newOrderItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [newOrderItems]);

  const handleCreateOrder = async () => {
    if (!firestore) return;
    if (newOrderItems.length === 0) {
      toast({ variant: "destructive", title: "Pedido vazio", description: "Adicione produtos para criar um pedido." });
      return;
    }
    if (!customerName.trim()) {
      toast({ variant: "destructive", title: "Cliente não identificado", description: "Por favor, insira o nome do cliente." });
      return;
    }
    
    try {
        await addOrder(firestore, {
          customerName: customerName,
          total: newOrderTotal,
          items: newOrderItems,
        });
        
        setNewOrderItems([]);
        setCustomerName("");
        toast({ title: "Pedido Criado!", description: `O pedido para ${customerName} foi criado com sucesso e o estoque foi atualizado.` });
    } catch(e: any) {
         toast({ variant: "destructive", title: "Erro ao criar pedido", description: e.message });
    }
  };


  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* New Order Section */}
        <div className="lg:col-span-2">
           <Card className="sticky top-24 w-full">
            <CardHeader>
              <CardTitle>Novo Pedido</CardTitle>
              <CardDescription>Crie um pedido rapidamente para venda no balcão.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produto..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                 <ScrollArea className="h-48 border rounded-md">
                    <Table>
                        <TableBody>
                        {filteredProducts.map((product) => (
                            <TableRow key={product.id} onClick={() => addProductToOrder(product)} className="cursor-pointer">
                                <TableCell className="py-2">{product.name}</TableCell>
                                <TableCell className="text-right py-2">
                                     <PlusCircle className="h-4 w-4 text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
                <Separator />
                <ScrollArea className="h-40">
                  {newOrderItems.length > 0 ? newOrderItems.map(item => (
                     <div key={item.productId} className="flex items-center gap-2 mb-2">
                        <Input type="number" value={item.quantity} onChange={e => updateQuantity(item.productId, parseInt(e.target.value) || 0)} className="w-16 h-8"/>
                        <span className="flex-1 truncate text-sm">{item.productName}</span>
                        <span className="text-sm font-medium">{(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.productId, 0)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                     </div>
                  )) : <p className="text-sm text-center text-muted-foreground py-10">Adicione produtos para começar.</p>}
                </ScrollArea>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="customer-name">Nome do Cliente</Label>
                    <Input id="customer-name" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nome do cliente" />
                </div>
                <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span>{newOrderTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <Button onClick={handleCreateOrder} disabled={newOrderItems.length === 0}>Finalizar Pedido</Button>
            </CardFooter>
           </Card>
        </div>

        {/* Existing Orders Section */}
        <div className="lg:col-span-3">
            <Card className="w-full">
                <CardHeader>
                <CardTitle>Pedidos Recebidos</CardTitle>
                <CardDescription>
                    Visualize e gerencie os pedidos recebidos.
                </CardDescription>
                </CardHeader>
                <CardContent>
                {isUserLoading || (areOrdersLoading && !orders) ? (
                  <div className="flex h-64 items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {orders?.map((order) => (
                        <TableRow key={order.id}>
                        <TableCell>
                            <div className="font-medium">{order.customerName}</div>
                            <div className="text-xs text-muted-foreground">{order.orderNumber} - {order.createdAt.toDate().toLocaleDateString("pt-BR")}</div>
                        </TableCell>
                        <TableCell>
                            {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL"})}
                        </TableCell>
                        <TableCell>
                            <div className="flex justify-center">
                            <Select value={order.status} onValueChange={(value: OrderStatus) => handleStatusChange(order.id, value)} >
                                <SelectTrigger className="w-44 h-9">
                                <Badge variant={getStatusVariant(order.status)} className={cn("w-full justify-start border-none",
                                    order.status === 'Em Preparo' && 'bg-amber-500 text-white hover:bg-amber-500/90',
                                    order.status === 'Pendente' && 'bg-yellow-500 text-white hover:bg-yellow-500/90',
                                    order.status === 'Pronto para Retirada' && 'bg-blue-500 text-white hover:bg-blue-500/90',
                                    order.status === 'Entregue' && 'bg-emerald-500 text-white hover:bg-emerald-500/90',
                                    order.status === 'Cancelado' && 'bg-red-500 text-white hover:bg-red-500/90')}>
                                    {order.status}
                                </Badge>
                                </SelectTrigger>
                                <SelectContent>
                                    {['Pendente', 'Em Preparo', 'Pronto para Retirada', 'Entregue', 'Cancelado'].map((status) => (
                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            </div>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                             <Button variant="ghost" size="icon" title="Editar Pedido" asChild>
                                <Link href={getEditOrderUrl(order)}><Pencil className="h-4 w-4" /></Link>
                            </Button>
                            <Dialog open={!!selectedOrder && selectedOrder.id === order.id} onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" title="Visualizar Detalhes" onClick={() => setSelectedOrder(order)}>
                                    <Eye className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                {selectedOrder && (
                                    <DialogContent className="max-w-md print:hidden">
                                    <DialogHeader>
                                        <DialogTitle>Detalhes do Pedido {selectedOrder.orderNumber}</DialogTitle>
                                    </DialogHeader>
                                    <OrderReceipt order={selectedOrder} />
                                    <DialogFooter className="gap-2 sm:justify-end">
                                        <DialogClose asChild><Button variant="outline">Fechar</Button></DialogClose>
                                        <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Imprimir</Button>
                                    </DialogFooter>
                                    </DialogContent>
                                )}
                            </Dialog>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                )}
                </CardContent>
            </Card>
        </div>
      </div>
      
      {/* Hidden printable component */}
      {selectedOrder && <OrderReceipt order={selectedOrder} className="hidden print:block" />}
    </>
  );
}
