// ===========================
// BUSINESS ENTITY TYPES
// ===========================

export type FreshnessStatus = 'FRESH' | 'GOOD' | 'WATCH' | 'MARKDOWN' | 'URGENT' | 'LIKELY_LOSS';
export type PaymentStatusType = 'paid' | 'partial' | 'credit';
export type QualityGrade = 'excellent' | 'good' | 'fair' | 'poor';
export type AccountType = 'cash' | 'bank' | 'digital';
export type PaymentMethodType = 'cash' | 'upi' | 'bank' | 'credit';
export type RiskLevel = 'healthy' | 'watch' | 'high' | 'critical';
export type ReorderAction = 'BUY' | 'HOLD' | 'WAIT' | 'CLEAR_FIRST';

export interface Customer {
  id: string;
  name: string;
  outstanding: number;
  overdue: number;
  totalSales: number;
  totalCollected: number;
  lastPaymentDate: string | null;
  lastPaymentAmount: number;
  avgPaymentDays: number;
  oldestDue: number; // days
  status: 'active' | 'inactive';
  risk: RiskLevel;
  salesThisMonth: number;
  collectedThisMonth: number;
}

export interface Supplier {
  id: string;
  name: string;
  outstanding: number;
  overdue: number;
  totalPurchases: number;
  totalPaid: number;
  lastPurchaseDate: string | null;
  avgQuality: QualityGrade;
  status: 'active' | 'inactive';
  purchasesThisMonth: number;
  paidThisMonth: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  variety?: string;
  unit: string;
  currentStock: number;
  avgCost: number;
  marketPrice: number;
  recommendedPrice: number;
  minPrice: number;
  inventoryValue: number;
  shelfLifeDays: number;
  reorderThreshold: number;
  dailySalesVelocity: number;
  daysOfStock: number;
  freshnessScore: number;
  freshnessStatus: FreshnessStatus;
  wastageThisMonth: number;
  active: boolean;
}

export interface StockLot {
  id: string;
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  purchaseDate: string;
  quantity: number;
  remainingQty: number;
  costPerUnit: number;
  freshnessScore: number;
  daysOld: number;
  status: FreshnessStatus;
  expectedRemainingDays: number;
  recommendedPrice: number;
  tomorrowPrice: number;
  clearancePrice: number;
  valueAtRisk: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  rate: number;
  total: number;
  freshness: FreshnessStatus;
  estimatedMargin: number;
}

export interface PaymentAllocation {
  method: PaymentMethodType;
  amount: number;
  account?: string;
}

export interface Sale {
  id: string;
  date: string;
  time: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  itemCount: number;
  total: number;
  received: number;
  credit: number;
  paymentStatus: PaymentStatusType;
  payments: PaymentAllocation[];
  freshnessImpact: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  rate: number;
  total: number;
  quality: QualityGrade;
}

export interface Purchase {
  id: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  itemCount: number;
  total: number;
  paid: number;
  credit: number;
  transport: number;
  landedCost: number;
  status: PaymentStatusType;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  moneyIn: number;
  moneyOut: number;
  icon: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethodType;
  account: string;
}

export interface ExpenseCategory {
  name: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface PriceEntry {
  product: string;
  marketPrice: number;
  avgCost: number;
  recommendedPrice: number;
  currentSellingPrice: number;
  margin: number;
  marginPercent: number;
  trend: number; // percentage change
  lastUpdated: string;
  source: 'manual' | 'market';
}

export interface ReorderRecommendation {
  product: string;
  currentStock: number;
  dailyVelocity: number;
  daysOfStock: number;
  freshnessWindow: number;
  supplierPrice: number;
  marketPrice: number;
  potentialMargin: number;
  suggestedQty: number;
  action: ReorderAction;
  reason: string;
}

export interface DailyClosing {
  sales: number;
  collections: number;
  purchases: number;
  supplierPayments: number;
  expenses: number;
  cashDeposits: number;
  wastage: number;
  expectedCash: number;
  physicalCash: number | null;
  difference: number | null;
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  label: string;
  value: number;
  value2?: number;
  value3?: number;
}
