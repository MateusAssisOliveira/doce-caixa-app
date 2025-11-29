
"use client";

import { useMemo, useEffect } from 'react';
import { useUser, useCollection, useFirestore, useMemoFirebase, useAuth } from "@/firebase";
import { collection, query, where, Timestamp } from "firebase/firestore";
import type { Order } from "@/types";
import { MetricCard } from "@/components/admin/metric-card";
import { SalesChart } from "@/components/admin/sales-chart";
import { TopProductsChart } from "@/components/admin/top-products-chart";
import { CashFlowChart } from "@/components/admin/cash-flow-chart";
import { PaymentMethodsChart } from "@/components/admin/payment-methods-chart";
import { RecentMovements } from "@/components/admin/recent-movements";
import { CashControl } from "@/components/admin/cash-control";
import { Loader } from 'lucide-react';
import { getPaymentMethodsData, getCashFlowData, getRecentMovements } from "@/services/dashboardService";
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

export default function DashboardPage() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  const sevenDaysAgo = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return Timestamp.fromDate(date);
  }, []);

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, "orders"),
      where("createdAt", ">=", sevenDaysAgo)
    );
  }, [firestore, user, sevenDaysAgo]);

  const { data: recentOrders, isLoading: areOrdersLoading } = useCollection<Order>(ordersQuery);

  const dashboardMetrics = useMemo(() => {
    if (!recentOrders) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);

    const salesToday = recentOrders
      .filter(order => order.createdAt >= todayTimestamp && (order.status === 'Entregue' || order.status === 'Pronto para Retirada'))
      .reduce((sum, order) => sum + order.total, 0);
      
    const completedOrdersToday = recentOrders.filter(order => order.createdAt >= todayTimestamp && (order.status === 'Entregue' || order.status === 'Pronto para Retirada'));
    
    const ticketMedio = completedOrdersToday.length > 0 ? salesToday / completedOrdersToday.length : 0;

    return [
      {
        title: "Vendas Hoje",
        value: salesToday.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        description: "Soma de todas as vendas concluídas no dia de hoje.",
      },
      {
        title: "Ticket Médio",
        value: ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        description: "Valor médio gasto por cliente em cada compra hoje.",
      },
       {
        title: "Pedidos Hoje",
        value: completedOrdersToday.length.toString(),
        description: "Total de pedidos finalizados hoje.",
    },
      {
        title: "Caixa (Exemplo)",
        value: "R$ 2.180,50",
        description: "Saldo atual em dinheiro no caixa físico (dado de exemplo).",
      }
    ];
  }, [recentOrders]);

  const salesLast7Days = useMemo(() => {
    if (!recentOrders) return [];
    
    const salesByDay: { [key: string]: number } = {};
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        salesByDay[d.toLocaleDateString('pt-BR')] = 0;
    }

    recentOrders.forEach(order => {
        if (order.status === 'Entregue' || order.status === 'Pronto para Retirada') {
            const orderDate = order.createdAt.toDate().toLocaleDateString('pt-BR');
            if (orderDate in salesByDay) {
                salesByDay[orderDate] += order.total;
            }
        }
    });

    return Object.entries(salesByDay).map(([date, Vendas]) => ({
      date: new Date(date.split('/').reverse().join('-')).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit'}),
      Vendas
    })).reverse();

  }, [recentOrders]);
  
  const topProductsData = useMemo(() => {
    if (!recentOrders) return [];
    
    const productCounts: { [key: string]: { name: string; vendas: number } } = {};
    
    recentOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productCounts[item.productId]) {
          productCounts[item.productId] = { name: item.productName, vendas: 0 };
        }
        productCounts[item.productId].vendas += item.quantity;
      });
    });
    
    return Object.values(productCounts)
      .sort((a, b) => b.vendas - a.vendas)
      .slice(0, 5);
      
  }, [recentOrders]);


  // Mantendo estes como estáticos por enquanto, pois não temos os dados no DB
  const cashFlowData = getCashFlowData();
  const paymentMethodsData = getPaymentMethodsData();
  const recentMovements = getRecentMovements();
  
  if (isUserLoading || (areOrdersLoading && !recentOrders)) {
      return (
        <div className="flex h-[calc(100vh-10rem)] w-full flex-col items-center justify-center gap-4">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
                <p className="text-lg font-semibold">Carregando Dashboard...</p>
                <p className="text-sm text-muted-foreground">
                Buscando os dados em tempo real. Por favor, aguarde.
                </p>
            </div>
        </div>
      )
  }
  
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold">Dashboard de Performance</h1>
        <p className="text-muted-foreground">Visão geral em tempo real do seu negócio.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mt-8">
        <SalesChart salesData={salesLast7Days} />
        <TopProductsChart productsData={topProductsData} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mt-8">
        <CashFlowChart cashFlowData={cashFlowData} />
        <PaymentMethodsChart paymentMethodsData={paymentMethodsData} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mt-8">
        <div className="lg:col-span-2">
          <RecentMovements movements={recentMovements} />
        </div>
        <div>
          <CashControl />
        </div>
      </div>

    </div>
  );
}
