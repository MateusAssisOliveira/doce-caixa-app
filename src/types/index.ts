// ARQUIVO DE DEFINIÇÕES DE TIPOS (TYPESCRIPT)
//
// Propósito:
// Este arquivo centraliza todas as definições de tipos e interfaces TypeScript
// que são usadas em múltiplas partes da aplicação.
//
// Responsabilidade:
// - Definir a "forma" dos objetos de dados (ex: `Product`, `Order`, `Supply`).
// - Garantir a consistência e a segurança de tipos em todo o projeto, ajudando a
//   prevenir erros durante o desenvolvimento.

import { Timestamp } from "firebase/firestore";

export type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    costPrice?: number; // Custo de produção, vindo da receita
    category: string;
    imageUrlId: string;
    stock_quantity: number;
    createdAt: Timestamp;
    isActive: boolean;
    technicalSheetId?: string; // ID da Ficha Técnica vinculada
};

export type DashboardMetric = {
    title: string;
    value: string;
    trend?: string;
    trendDirection?: "positive" | "negative";
    description?: string;
}

export type FinancialMovement = {
    id: string;
    date: string;
    description: string;
    category: string;
    type: 'income' | 'expense';
    value: number;
    method: string;
}

export type OrderStatus = 'Pendente' | 'Em Preparo' | 'Pronto para Retirada' | 'Entregue' | 'Cancelado';

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  createdAt: Timestamp;
  date?: string; // Mantido para retrocompatibilidade com dados antigos, se houver
  total: number;
  status: OrderStatus;
  items: OrderItem[];
};

export type Supply = {
  id: string;
  name: string;
  sku: string; // ID personalizado / código do produto
  stock: number;
  unit: "kg" | "L" | "un";
  costPerUnit: number;
  supplier: string; // Fornecedor
  lastPurchaseDate: Timestamp | Date | undefined; // Data da última compra
  minStock: number; // Estoque mínimo desejado
  createdAt?: Timestamp;
  isActive: boolean;
};


export type TechnicalSheetComponent = {
  componentId: string; // Pode ser um supplyId ou outro technicalSheetId
  componentName: string;
  componentType: 'supply' | 'sheet';
  quantity: number;
  unit: string; // g, ml, un, etc.
}

export type TechnicalSheet = {
  id: string;
  name: string;
  description: string;
  type: 'base' | 'final'; // Ficha de base (receita) ou Ficha de produto final (montagem)
  components: TechnicalSheetComponent[];
  steps: string; // Modo de Preparo
  yield: string; // ex: "10 potes de 200g"
  totalCost: number;
  suggestedPrice: number;
  createdAt: Timestamp;
  isActive: boolean;
}


export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrlId: string;
  quantity: number;
};


export type HighlightCategory = {
    title: string;
    description: string;
    imageUrlId: string;
    href: string;
}

// Manter o tipo Recipe para retrocompatibilidade se necessário, mas usar TechnicalSheet para novo desenvolvimento
export type Recipe = TechnicalSheet;
export type RecipeIngredient = TechnicalSheetComponent;
