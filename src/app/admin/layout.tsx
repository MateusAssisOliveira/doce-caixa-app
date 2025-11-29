
// LAYOUT PRINCIPAL DA ÁREA ADMINISTRATIVA
//
// Propósito:
// Este arquivo define a estrutura visual comum a todas as páginas da área administrativa.
// Ele inclui a barra lateral de navegação (Sidebar) e o cabeçalho superior.
//
// Responsabilidade:
// - Prover a navegação principal através da Sidebar.
// - Exibir o cabeçalho com o título da página e ações contextuais.
// - Manter a consistência visual em todo o painel de controle.
// - Gerenciar o estado da Sidebar (aberta/fechada) através do `SidebarProvider`.
// - Renderizar o conteúdo da página atual (passado como `children`).

"use client";

import React from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  NotebookPen,
  ArrowLeft,
  CakeSlice,
  LogOut,
  User,
  Terminal,
  Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FirebaseClientProvider } from '@/firebase';
import PageTransition from '@/components/page-transition';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path || (path !== "/admin/dashboard" && pathname.startsWith(path));
  const isDashboard = pathname === "/admin/dashboard";
  
  return (
    <FirebaseClientProvider>
      <div className="theme-admin">
        <SidebarProvider>
          <div className="group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar">
            <Sidebar>
              <SidebarHeader>
                <div className="flex items-center gap-2 p-2">
                  <CakeSlice className="h-6 w-6 text-sidebar-primary" />
                  <span className="font-headline text-xl font-bold text-sidebar-foreground">Doce Caixa</span>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/admin/dashboard")}>
                      <Link href="/admin/dashboard">
                        <LayoutDashboard />
                        Dashboard
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/admin/orders")}>
                      <Link href="/admin/orders">
                        <Terminal />
                        Ponto de Venda
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/admin/supplies")}>
                      <Link href="/admin/supplies">
                        <Warehouse />
                        Insumos
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/admin/products")}>
                      <Link href="/admin/products">
                        <Package />
                        Produtos
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/admin/recipes")}>
                      <Link href="/admin/recipes">
                        <NotebookPen />
                        Fichas Técnicas
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/admin/calculator")}>
                      <Link href="/admin/calculator">
                        <Calculator />
                        Calculadora Rápida
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
              <SidebarFooter>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/">
                        <LogOut />
                        Sair
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
            </Sidebar>
            <SidebarInset className="bg-muted/30">
              <header className="flex h-16 items-center justify-between px-6 border-b bg-background shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="md:hidden">
                    <SidebarTrigger />
                  </div>
                  {!isDashboard && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/admin/dashboard">
                        <ArrowLeft />
                        Voltar ao Dashboard
                      </Link>
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="ghost" asChild>
                    <Link href="/">Voltar ao Site</Link>
                  </Button>
                  <Avatar className="h-9 w-9">
                    <AvatarFallback><User/></AvatarFallback>
                  </Avatar>
                </div>
              </header>
              <main className="flex flex-1">
                <div className="flex-1 p-4 sm:p-6 md:p-8 flex">
                  <PageTransition>{children}</PageTransition>
                </div>
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </FirebaseClientProvider>
  );
}
