const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://usmanhardware.site/wp-json/ims/v1';

// New monthly report interfaces
export interface MonthlyProductSale {
  year: number;
  month: number;
  product_id: number;
  product_name: string;
  sku: string;
  category_name: string;
  unit: string;
  current_price: string;
  current_cost: string;
  current_stock_level: number;
  product_status: string;
  times_sold: number;
  total_quantity_sold: number;
  total_revenue: string;
  total_cost: string;
  total_profit: string;
  profit_margin_percent: number;
}

export interface MonthlyCustomerPurchase {
  year: number;
  month: number;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  customer_type: string;
  customer_status: string;
  outstanding_balance: string;
  credit_limit: string;
  times_purchased: number;
  total_items_purchased: number;
  total_purchase_value: string;
  cash_purchases: string;
  credit_purchases: string;
  bank_purchases: string;
  first_purchase_date: string;
  last_purchase_date: string;
}

export interface MonthlyTopProduct {
  year: number;
  month: number;
  product_id: number;
  product_name: string;
  category_name: string;
  times_sold: number;
  total_quantity: number;
  total_revenue: string;
}

export interface MonthlyTopCustomer {
  year: number;
  month: number;
  customer_id: number;
  customer_name: string;
  customer_type: string;
  times_purchased: number;
  total_purchase_value: string;
}

export interface MonthlyCategoryPerformance {
  year: number;
  month: number;
  category_id: number;
  category_name: string;
  unique_products_sold: number;
  total_orders: number;
  total_quantity_sold: number;
  total_revenue: string;
  total_profit: string;
  profit_margin_percent: number;
}

export interface MonthlySalesOverview {
  year: number;
  month: number;
  total_orders: number;
  unique_customers: number;
  unique_products_sold: number;
  total_items_sold: number;
  total_subtotal: string;
  total_discount: string;
  total_tax: string;
  total_revenue: string;
  avg_order_value: string;
  cash_orders: number;
  credit_orders: number;
  bank_transfer_orders: number;
  permanent_customer_revenue: string;
  semi_permanent_customer_revenue: string;
  temporary_customer_revenue: string;
}

// Legacy interfaces for backward compatibility
export interface ProfitabilityTrendData {
  month: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

export interface CustomerSegmentData {
  segment: string;
  value: number;
  count: number;
}

export interface RevenueForecastData {
  period: string;
  forecast: number;
  confidence: number;
}

export interface InventoryHealthData {
  product: string;
  status: string;
  turnover: number;
  value: number;
}

export interface KPIMetricsData {
  salesGrowth: number;
  customerRetention: number;
  profitMargin: number;
  inventoryTurnover: number;
  revenue: number;
  revenueGrowth: number;
  salesCount: number;
}

export interface PerformanceScorecardData {
  overall: number;
  sales: number;
  customers: number;
  inventory: number;
  financial: number;
  salesPerformance: number;
  customerSatisfaction: number;
  inventoryEfficiency: number;
}

export interface OpportunityData {
  id: string;
  title: string;
  description: string;
  impact: string;
  priority: string;
  potential: string;
}

export interface RiskData {
  id: string;
  title: string;
  description: string;
  severity: string;
  mitigation: string;
}

export interface ActionItemData {
  id: string;
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  timeframe: string;
}

export interface SalesReport {
  data: {
    total_revenue: number;
    orders_count: number;
    avg_order_value: number;
    growth_rate: number;
    summary?: {
      totalRevenue: number;
      totalOrders: number;
      avgOrderValue: number;
      growth: number;
    };
  };
}

export interface InventoryReport {
  data: {
    total_products: number;
    total_value: number;
    low_stock_items: Array<{ name: string; quantity: number; productName?: string; currentStock?: number; minStock?: number; reorderQuantity?: number }>;
    inventoryReport?: {
      totalProducts: number;
      totalValue: number;
      lowStockItems: Array<{ productName: string; currentStock: number; minStock: number; reorderQuantity: number }>;
      fastMovingItems?: Array<any>;
      slowMovingItems?: Array<any>;
    };
  };
}

export interface FinancialReport {
  data: {
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
    financialReport?: {
      revenue: { total: number };
      expenses: { total: number };
      profit: { gross: number; net: number; margin: number };
    };
  };
}

export const reportsApi = {
  // New monthly report methods
  getMonthlyProductSales: async (): Promise<MonthlyProductSale[]> => {
    const response = await fetch(`${API_BASE_URL}/monthly-product-sales`);
    if (!response.ok) throw new Error('Failed to fetch monthly product sales');
    const data = await response.json();
    return data.success ? data.data : [];
  },

  getMonthlyCustomerPurchases: async (): Promise<MonthlyCustomerPurchase[]> => {
    const response = await fetch(`${API_BASE_URL}/monthly-customer-purchases`);
    if (!response.ok) throw new Error('Failed to fetch monthly customer purchases');
    const data = await response.json();
    return data.success ? data.data : [];
  },

  getMonthlyTopProducts: async (): Promise<MonthlyTopProduct[]> => {
    const response = await fetch(`${API_BASE_URL}/monthly-top-products`);
    if (!response.ok) throw new Error('Failed to fetch monthly top products');
    const data = await response.json();
    return data.success ? data.data : [];
  },

  getMonthlyTopCustomers: async (): Promise<MonthlyTopCustomer[]> => {
    const response = await fetch(`${API_BASE_URL}/monthly-top-customers`);
    if (!response.ok) throw new Error('Failed to fetch monthly top customers');
    const data = await response.json();
    return data.success ? data.data : [];
  },

  getMonthlyCategoryPerformance: async (): Promise<MonthlyCategoryPerformance[]> => {
    const response = await fetch(`${API_BASE_URL}/monthly-category-performance`);
    if (!response.ok) throw new Error('Failed to fetch monthly category performance');
    const data = await response.json();
    return data.success ? data.data : [];
  },

  getMonthlySalesOverview: async (): Promise<MonthlySalesOverview[]> => {
    const response = await fetch(`${API_BASE_URL}/monthly-sales-overview`);
    if (!response.ok) throw new Error('Failed to fetch monthly sales overview');
    const data = await response.json();
    return data.success ? data.data : [];
  },

  // Legacy methods for backward compatibility
  getSalesReport: async (_params?: { period?: string }): Promise<SalesReport> => {
    try {
      const overview = await reportsApi.getMonthlySalesOverview();
      const latest = overview[0];
      return {
        data: {
          total_revenue: latest ? parseFloat(latest.total_revenue) : 0,
          orders_count: latest?.total_orders || 0,
          avg_order_value: latest ? parseFloat(latest.avg_order_value) : 0,
          growth_rate: 0,
          summary: {
            totalRevenue: latest ? parseFloat(latest.total_revenue) : 0,
            totalOrders: latest?.total_orders || 0,
            avgOrderValue: latest ? parseFloat(latest.avg_order_value) : 0,
            growth: 0,
          }
        }
      };
    } catch {
      return {
        data: {
          total_revenue: 0,
          orders_count: 0,
          avg_order_value: 0,
          growth_rate: 0,
          summary: { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, growth: 0 }
        }
      };
    }
  },

  getInventoryReport: async (): Promise<InventoryReport> => {
    try {
      const products = await reportsApi.getMonthlyProductSales();
      const lowStock = products.filter(p => p.current_stock_level < 10);
      return {
        data: {
          total_products: products.length,
          total_value: products.reduce((sum, p) => sum + parseFloat(p.total_revenue), 0),
          low_stock_items: lowStock.map(p => ({ 
            name: p.product_name, 
            quantity: p.current_stock_level,
            productName: p.product_name,
            currentStock: p.current_stock_level,
            minStock: 10,
            reorderQuantity: 10 - p.current_stock_level
          })),
          inventoryReport: {
            totalProducts: products.length,
            totalValue: products.reduce((sum, p) => sum + parseFloat(p.total_revenue), 0),
            lowStockItems: lowStock.map(p => ({
              productName: p.product_name,
              currentStock: p.current_stock_level,
              minStock: 10,
              reorderQuantity: Math.max(0, 10 - p.current_stock_level)
            })),
            fastMovingItems: products.filter(p => p.times_sold > 10).slice(0, 5),
            slowMovingItems: products.filter(p => p.times_sold <= 2).slice(0, 5),
          }
        }
      };
    } catch {
      return {
        data: {
          total_products: 0,
          total_value: 0,
          low_stock_items: [],
          inventoryReport: {
            totalProducts: 0,
            totalValue: 0,
            lowStockItems: [],
            fastMovingItems: [],
            slowMovingItems: []
          }
        }
      };
    }
  },

  getFinancialReport: async (_params?: { period?: string; year?: number }): Promise<FinancialReport> => {
    try {
      const overview = await reportsApi.getMonthlySalesOverview();
      const categories = await reportsApi.getMonthlyCategoryPerformance();
      const latest = overview[0];
      const totalProfit = categories.reduce((sum, c) => sum + parseFloat(c.total_profit), 0);
      const totalRevenue = latest ? parseFloat(latest.total_revenue) : 0;
      const expenses = totalRevenue - totalProfit;
      const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
      return {
        data: {
          revenue: totalRevenue,
          expenses: expenses,
          profit: totalProfit,
          margin: margin,
          financialReport: {
            revenue: { total: totalRevenue },
            expenses: { total: expenses },
            profit: { gross: totalProfit, net: totalProfit, margin: margin }
          }
        }
      };
    } catch {
      return {
        data: {
          revenue: 0,
          expenses: 0,
          profit: 0,
          margin: 0,
          financialReport: {
            revenue: { total: 0 },
            expenses: { total: 0 },
            profit: { gross: 0, net: 0, margin: 0 }
          }
        }
      };
    }
  },

  // Advanced reports methods (stub implementations for backward compatibility)
  getProfitabilityTrend: async (_params: { period: string; year: number; months: number }): Promise<{ success: boolean; data: ProfitabilityTrendData[] }> => {
    try {
      const categories = await reportsApi.getMonthlyCategoryPerformance();
      const data: ProfitabilityTrendData[] = categories.map(c => ({
        month: `${c.year}-${c.month}`,
        revenue: parseFloat(c.total_revenue),
        cost: parseFloat(c.total_revenue) - parseFloat(c.total_profit),
        profit: parseFloat(c.total_profit),
        margin: c.profit_margin_percent
      }));
      return { success: true, data };
    } catch {
      return { success: false, data: [] };
    }
  },

  getCustomerSegmentation: async (_params: { period: string; segmentBy: string }): Promise<{ success: boolean; data: CustomerSegmentData[] }> => {
    try {
      const customers = await reportsApi.getMonthlyCustomerPurchases();
      const segments: Record<string, CustomerSegmentData> = {};
      customers.forEach(c => {
        const type = c.customer_type || 'Other';
        if (!segments[type]) segments[type] = { segment: type, value: 0, count: 0 };
        segments[type].value += parseFloat(c.total_purchase_value);
        segments[type].count += 1;
      });
      return { success: true, data: Object.values(segments) };
    } catch {
      return { success: false, data: [] };
    }
  },

  getRevenueForecast: async (_params: { months: number; includeConfidence: boolean; model: string }): Promise<{ success: boolean; data: RevenueForecastData[] }> => {
    return { success: true, data: [] };
  },

  getInventoryHealthMatrix: async (): Promise<{ success: boolean; data: InventoryHealthData[] }> => {
    try {
      const products = await reportsApi.getMonthlyProductSales();
      const data: InventoryHealthData[] = products.slice(0, 20).map(p => ({
        product: p.product_name,
        status: p.current_stock_level < 10 ? 'low' : p.current_stock_level < 50 ? 'medium' : 'healthy',
        turnover: p.times_sold,
        value: parseFloat(p.total_revenue)
      }));
      return { success: true, data };
    } catch {
      return { success: false, data: [] };
    }
  },

  getKPIMetrics: async (_params: { period: string; compareWith: string }): Promise<{ success: boolean; data: KPIMetricsData | null }> => {
    try {
      const categories = await reportsApi.getMonthlyCategoryPerformance();
      const avgMargin = categories.reduce((sum, c) => sum + c.profit_margin_percent, 0) / (categories.length || 1);
      const totalRevenue = categories.reduce((sum, c) => sum + parseFloat(c.total_revenue), 0);
      return {
        success: true,
        data: {
          salesGrowth: 0,
          customerRetention: 85,
          profitMargin: avgMargin,
          inventoryTurnover: 4.5,
          revenue: totalRevenue,
          revenueGrowth: 0,
          salesCount: categories.reduce((sum, c) => sum + c.total_orders, 0)
        }
      };
    } catch {
      return { success: false, data: null };
    }
  },

  getPerformanceScorecard: async (): Promise<{ success: boolean; data: PerformanceScorecardData | null }> => {
    return {
      success: true,
      data: {
        overall: 75,
        sales: 80,
        customers: 70,
        inventory: 65,
        financial: 85,
        salesPerformance: 80,
        customerSatisfaction: 70,
        inventoryEfficiency: 65
      }
    };
  },

  getGrowthOpportunities: async (): Promise<{ success: boolean; data: OpportunityData[] }> => {
    return { success: true, data: [] };
  },

  getRiskFactors: async (): Promise<{ success: boolean; data: RiskData[] }> => {
    return { success: true, data: [] };
  },

  getActionItems: async (_params: { priority: string; timeframe: string }): Promise<{ success: boolean; data: ActionItemData[] }> => {
    return { success: true, data: [] };
  },
};
