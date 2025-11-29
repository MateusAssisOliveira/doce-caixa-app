
'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Settings, 
  Users, 
  Menu, 
  X, 
  ChevronDown 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavButton = ({ href, icon: Icon, label, isActive }) => (
  <Link href={href}>
    <span
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
        isActive 
          ? 'bg-primary-100 text-primary-700' 
          : 'text-slate-500 hover:bg-primary-50 hover:text-primary-600'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </span>
  </Link>
);

export default function AdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full">
        <div className="p-6 h-16 flex items-center border-b border-primary-100">
          <div className="flex items-center gap-2 font-bold text-xl text-primary-800 tracking-tight">
            <div className="h-8 w-8 bg-primary-700 text-white rounded-lg flex items-center justify-center">
              <ShoppingBag className="h-5 w-5" />
            </div>
            DoceGestão
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 py-6">
          <nav className="space-y-1">
            <p className="px-2 text-xs font-semibold text-primary-400 mb-2">Visão Geral</p>
            <NavButton href="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" isActive={pathname.startsWith('/admin/dashboard')} />
            <NavButton href="/admin/orders" icon={ShoppingBag} label="Pedidos" isActive={pathname.startsWith('/admin/orders')} />
            <NavButton href="/admin/products" icon={Package} label="Produtos" isActive={pathname.startsWith('/admin/products')} />
            
            <p className="px-2 text-xs font-semibold text-primary-400 mt-8 mb-2">Gestão</p>
            <NavButton href="#" icon={Users} label="Clientes" isActive={false} />
            <NavButton href="#" icon={Settings} label="Configurações" isActive={false} />
          </nav>
        </div>

        <div className="p-4 border-t border-primary-100">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary-50 transition-colors cursor-pointer">
            <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm border border-primary-200">
              AD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-primary-900 truncate">Administrador</p>
              <p className="text-xs text-primary-500 truncate">admin@docegestao.com.br</p>
            </div>
            <ChevronDown className="h-4 w-4 text-primary-400" />
          </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-primary-50/50 flex font-sans text-primary-900 selection:bg-primary-100">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-[240px] border-r border-primary-200 bg-white fixed h-full z-10">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-[240px] bg-white transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-50 md:hidden border-r border-primary-200`}>
        {sidebarContent}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[240px] min-h-screen flex flex-col">
        {/* Header Mobile/Desktop */}
        <header className="h-16 border-b border-primary-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-slate-500 hover:text-slate-900">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
