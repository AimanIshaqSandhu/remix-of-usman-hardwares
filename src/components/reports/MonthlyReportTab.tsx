import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { salesApi } from "@/services/api";
import { profitApi } from "@/services/profitApi";
import { format, startOfMonth, endOfMonth, subMonths, isAfter } from "date-fns";
import {
  Calendar,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  BarChart3
} from "lucide-react";

interface SaleItem {
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category?: string;
}

interface Sale {
  id: number;
  order_number?: string;
  customer_name: string;
  customer_phone?: string;
  customer_type?: string;
  items: SaleItem[];
  total_amount: number;
  payment_method?: string;
  status?: string;
  created_at: string;
}

interface ProductSold {
  name: string;
  sku: string;
  category: string;
  quantity: number;
  revenue: number;
  avgPrice: number;
}

interface CustomerPurchase {
  name: string;
  phone: string;
  type: string;
  orders: number;
  totalSpent: number;
  products: string[];
}

interface MonthOption {
  value: string;
  label: string;
  year: number;
  month: number;
}

const MonthlyReportTab = () => {
  // Generate month options (last 12 months + current)
  const monthOptions = useMemo((): MonthOption[] => {
    const options: MonthOption[] = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = subMonths(now, i);
      const year = date.getFullYear();
      const month = date.getMonth();
      options.push({
        value: `${year}-${String(month + 1).padStart(2, '0')}`,
        label: format(date, 'MMMM yyyy'),
        year,
        month: month + 1
      });
    }
    return options;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(monthOptions[0]?.value || "");

  // Get date range for selected month
  const dateRange = useMemo(() => {
    if (!selectedMonth) return { dateFrom: "", dateTo: "", periodLabel: "" };
    
    const [year, month] = selectedMonth.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const now = new Date();
    
    // If current month, use today as end date
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
    const endDate = isCurrentMonth ? now : endOfMonth(startDate);
    
    return {
      dateFrom: format(startDate, 'yyyy-MM-dd'),
      dateTo: format(endDate, 'yyyy-MM-dd'),
      periodLabel: isCurrentMonth 
        ? `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')} (Current Month)`
        : format(startDate, 'MMMM yyyy')
    };
  }, [selectedMonth]);

  // Fetch sales for selected month
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['monthly-report-sales', dateRange.dateFrom, dateRange.dateTo],
    queryFn: async () => {
      if (!dateRange.dateFrom || !dateRange.dateTo) return [];
      const response = await salesApi.getAll({
        dateFrom: dateRange.dateFrom,
        dateTo: dateRange.dateTo,
        limit: 10000
      });
      return response.success !== false ? (response.data?.sales || response.sales || response || []) : [];
    },
    enabled: !!dateRange.dateFrom && !!dateRange.dateTo
  });

  // Fetch monthly report summary
  const { data: monthlyReportData } = useQuery({
    queryKey: ['monthly-report-summary'],
    queryFn: profitApi.getMonthlyReport,
  });

  // Get summary for selected month
  const selectedMonthSummary = useMemo(() => {
    if (!monthlyReportData || !selectedMonth) return null;
    return monthlyReportData.find((item: any) => item.period === selectedMonth);
  }, [monthlyReportData, selectedMonth]);

  // Process sales data to get products sold
  const productsSold = useMemo((): ProductSold[] => {
    if (!salesData || !Array.isArray(salesData)) return [];
    
    const productMap = new Map<string, ProductSold>();
    
    salesData.forEach((sale: Sale) => {
      const items = sale.items || [];
      items.forEach((item: SaleItem) => {
        const key = item.product_sku || item.product_name;
        const existing = productMap.get(key);
        
        if (existing) {
          existing.quantity += item.quantity || 0;
          existing.revenue += item.total_price || 0;
          existing.avgPrice = existing.revenue / existing.quantity;
        } else {
          productMap.set(key, {
            name: item.product_name || 'Unknown Product',
            sku: item.product_sku || '-',
            category: item.category || 'Uncategorized',
            quantity: item.quantity || 0,
            revenue: item.total_price || 0,
            avgPrice: item.unit_price || 0
          });
        }
      });
    });
    
    return Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue);
  }, [salesData]);

  // Process sales data to get customer purchases
  const customerPurchases = useMemo((): CustomerPurchase[] => {
    if (!salesData || !Array.isArray(salesData)) return [];
    
    const customerMap = new Map<string, CustomerPurchase>();
    
    salesData.forEach((sale: Sale) => {
      const key = sale.customer_name || 'Walk-in Customer';
      const existing = customerMap.get(key);
      
      const productNames = (sale.items || []).map((item: SaleItem) => item.product_name);
      
      if (existing) {
        existing.orders += 1;
        existing.totalSpent += sale.total_amount || 0;
        existing.products = [...new Set([...existing.products, ...productNames])];
      } else {
        customerMap.set(key, {
          name: key,
          phone: sale.customer_phone || '-',
          type: sale.customer_type || 'Individual',
          orders: 1,
          totalSpent: sale.total_amount || 0,
          products: productNames
        });
      }
    });
    
    return Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [salesData]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalRevenue = selectedMonthSummary?.revenue 
      ? parseFloat(selectedMonthSummary.revenue) 
      : productsSold.reduce((sum, p) => sum + p.revenue, 0);
    const totalProfit = selectedMonthSummary?.profit 
      ? parseFloat(selectedMonthSummary.profit) 
      : 0;
    const totalSalesCount = selectedMonthSummary?.sales_count 
      ? parseInt(selectedMonthSummary.sales_count) 
      : (salesData?.length || 0);
    const totalProducts = productsSold.reduce((sum, p) => sum + p.quantity, 0);
    const uniqueCustomers = customerPurchases.length;
    
    return { totalRevenue, totalProfit, totalSalesCount, totalProducts, uniqueCustomers };
  }, [selectedMonthSummary, productsSold, salesData, customerPurchases]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="space-y-4">
      {/* Month Selector */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly Sales Report
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {dateRange.periodLabel}
              </p>
            </div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="text-xs font-medium text-muted-foreground">Revenue</span>
            </div>
            <p className="text-xl font-bold mt-1">
              {salesLoading ? <Skeleton className="h-6 w-24" /> : formatCurrency(totals.totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-xs font-medium text-muted-foreground">Profit</span>
            </div>
            <p className="text-xl font-bold mt-1">
              {salesLoading ? <Skeleton className="h-6 w-24" /> : formatCurrency(totals.totalProfit)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-purple-600" />
              <span className="text-xs font-medium text-muted-foreground">Orders</span>
            </div>
            <p className="text-xl font-bold mt-1">
              {salesLoading ? <Skeleton className="h-6 w-16" /> : totals.totalSalesCount}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              <span className="text-xs font-medium text-muted-foreground">Products Sold</span>
            </div>
            <p className="text-xl font-bold mt-1">
              {salesLoading ? <Skeleton className="h-6 w-16" /> : totals.totalProducts}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-pink-600" />
              <span className="text-xs font-medium text-muted-foreground">Customers</span>
            </div>
            <p className="text-xl font-bold mt-1">
              {salesLoading ? <Skeleton className="h-6 w-16" /> : totals.uniqueCustomers}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products and Customers Tabs */}
      <Card>
        <CardContent className="pt-4">
          <Tabs defaultValue="products" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products" className="gap-2">
                <Package className="h-4 w-4" />
                Products Sold ({productsSold.length})
              </TabsTrigger>
              <TabsTrigger value="customers" className="gap-2">
                <Users className="h-4 w-4" />
                Customers ({customerPurchases.length})
              </TabsTrigger>
            </TabsList>

            {/* Products Sold Tab */}
            <TabsContent value="products">
              {salesLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : productsSold.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No products sold in this period</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Qty Sold</TableHead>
                        <TableHead className="text-right">Avg Price</TableHead>
                        <TableHead className="text-right">Total Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsSold.map((product, index) => (
                        <TableRow key={product.sku + index}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">{product.sku}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{product.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(product.avgPrice)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(product.revenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </TabsContent>

            {/* Customers Tab */}
            <TabsContent value="customers">
              {salesLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : customerPurchases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No customer purchases in this period</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead className="text-right">Total Spent</TableHead>
                        <TableHead>Products Bought</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerPurchases.map((customer, index) => (
                        <TableRow key={customer.name + index}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell className="text-muted-foreground">{customer.phone}</TableCell>
                          <TableCell>
                            <Badge variant={customer.type === 'business' ? 'default' : 'secondary'}>
                              {customer.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{customer.orders}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(customer.totalSpent)}</TableCell>
                          <TableCell className="max-w-[200px]">
                            <div className="flex flex-wrap gap-1">
                              {customer.products.slice(0, 3).map((product, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {product.length > 15 ? product.substring(0, 15) + '...' : product}
                                </Badge>
                              ))}
                              {customer.products.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{customer.products.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyReportTab;
