// CAMADA DE SERVIÇO PARA O DASHBOARD
//
// Propósito:
// Este arquivo abstrai a lógica de busca de dados especificamente para a página do dashboard.
// Ele centraliza as fontes de dados para os componentes que ainda não foram migrados para dados dinâmicos.
//
// Responsabilidade:
// - Fornecer funções que retornam os dados necessários para cada componente do dashboard.
// - Em um aplicativo real, essas funções fariam chamadas a uma API de backend para obter
//   dados atualizados. Atualmente, elas retornam dados mocados (simulados).

import type { FinancialMovement } from '@/types';

// Mock data para componentes que ainda não foram conectados ao Firebase.
// Em um app real, essas funções buscariam dados de uma API ou banco de dados.

const mockCashFlowData = [
  { name: 'Seg', Entradas: 1200, Saídas: 400 },
  { name: 'Ter', Entradas: 1500, Saídas: 600 },
  { name: 'Qua', Entradas: 1100, Saídas: 300 },
  { name: 'Qui', Entradas: 1800, Saídas: 800 },
  { name: 'Sex', Entradas: 2500, Saídas: 1000 },
  { name: 'Sáb', Entradas: 3200, Saídas: 1200 },
  { name: 'Dom', Entradas: 900, Saídas: 200 },
];

const mockPaymentMethodsData = [
  { name: 'Cartão de Crédito', value: 45, fill: 'hsl(var(--chart-1))' },
  { name: 'Cartão de Débito', value: 25, fill: 'hsl(var(--chart-2))' },
  { name: 'PIX', value: 20, fill: 'hsl(var(--chart-3))' },
  { name: 'Dinheiro', value: 10, fill: 'hsl(var(--chart-5))' },
];

const mockRecentMovements: FinancialMovement[] = [
  { id: 'mov_001', date: '2024-07-29T14:35:00', description: 'Venda Pedido #1024', category: 'Venda Balcão', type: 'income', value: 85.50, method: 'PIX' },
  { id: 'mov_002', date: '2024-07-29T13:10:00', description: 'Pagamento Fornecedor de Farinha', category: 'Fornecedor', type: 'expense', value: -250.00, method: 'Transferência' },
  { id: 'mov_003', date: '2024-07-29T12:05:00', description: 'Venda Balcão', category: 'Venda Balcão', type: 'income', value: 45.00, method: 'Crédito' },
  { id: 'mov_004', date: '2024-07-29T10:15:00', description: 'Compra de Embalagens', category: 'Insumos', type: 'expense', value: -120.00, method: 'Débito' },
  { id: 'mov_005', date: '2024-07-29T09:30:00', description: 'Venda Pedido #1023', category: 'Pedido Online', type: 'income', value: 150.00, method: 'Crédito' },
];


export const getCashFlowData = () => {
    return mockCashFlowData;
}

export const getPaymentMethodsData = () => {
    return mockPaymentMethodsData;
}

export const getRecentMovements = () => {
    return mockRecentMovements;
}
