import { apiConfig } from '@/utils/apiConfig';

// API Types for Monthly Report
export interface MonthlyReportSummary {
  period: string;
  periodLabel: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalRevenue: number;
    totalProfit: number;
    profitMargin: number;
    totalOrders: number;
    totalProductsSold: number;
    uniqueProducts: number;
    uniqueCustomers: number;
    averageOrderValue: number;
    topPaymentMethod: string;
  };
}

export interface ProductSold {
  productId: number;
  productName: string;
  productSku: string;
  category: string;
  quantitySold: number;
  unitPrice: number;
  totalRevenue: number;
  costPrice: number;
  totalCost: number;
  profit: number;
  profitMargin: number;
  ordersCount: number;
}

export interface ProductsResponse {
  products: ProductSold[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  totals: {
    totalQuantitySold: number;
    totalRevenue: number;
    totalProfit: number;
  };
}

export interface CustomerPurchase {
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerType: string;
  ordersCount: number;
  totalSpent: number;
  totalProfit: number;
  averageOrderValue: number;
  productsBought: Array<{ productName: string; quantity: number }>;
  lastOrderDate: string;
}

export interface CustomersResponse {
  customers: CustomerPurchase[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  totals: {
    totalCustomers: number;
    totalRevenue: number;
    newCustomersThisMonth: number;
  };
}

export interface CategoryPerformance {
  categoryName: string;
  productCount: number;
  quantitySold: number;
  revenue: number;
  profit: number;
  profitMargin: number;
  percentageOfTotal: number;
}

export interface DailyData {
  date: string;
  dayOfWeek: string;
  ordersCount: number;
  revenue: number;
  profit: number;
  productsSold: number;
}

export interface DailyBreakdownResponse {
  dailyData: DailyData[];
  bestDay: {
    date: string;
    revenue: number;
  };
  averageDaily: {
    orders: number;
    revenue: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${apiConfig.getBaseUrl()}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Monthly Report API request failed:', error);
    throw error;
  }
};

// Monthly Report API
export const monthlyReportApi = {
  // Get monthly summary
  getSummary: (year: number, month: number) =>
    apiRequest<MonthlyReportSummary>(`/monthly-report/${year}/${month}/summary`),

  // Get products sold in the month
  getProducts: (year: number, month: number, params?: {
    page?: number;
    limit?: number;
    sortBy?: 'revenue' | 'quantity' | 'name';
    sortOrder?: 'asc' | 'desc';
    search?: string;
    category?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return apiRequest<ProductsResponse>(`/monthly-report/${year}/${month}/products${query ? `?${query}` : ''}`);
  },

  // Get customer purchases for the month
  getCustomers: (year: number, month: number, params?: {
    page?: number;
    limit?: number;
    sortBy?: 'totalSpent' | 'orders' | 'name';
    sortOrder?: 'asc' | 'desc';
    search?: string;
    type?: 'individual' | 'business';
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return apiRequest<CustomersResponse>(`/monthly-report/${year}/${month}/customers${query ? `?${query}` : ''}`);
  },

  // Get category performance
  getCategories: (year: number, month: number) =>
    apiRequest<{ categories: CategoryPerformance[] }>(`/monthly-report/${year}/${month}/categories`),

  // Get daily breakdown
  getDailyBreakdown: (year: number, month: number) =>
    apiRequest<DailyBreakdownResponse>(`/monthly-report/${year}/${month}/daily`),
};
