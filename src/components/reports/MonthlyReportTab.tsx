import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { monthlyReportApi, ProductSold, CustomerPurchase, CategoryPerformance, DailyData } from "@/services/monthlyReportApi";
import { format, subMonths } from "date-fns";
import {
  Calendar,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  Search,
  PieChart,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

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
      const month = date.getMonth() + 1;
      options.push({
        value: `${year}-${String(month).padStart(2, '0')}`,
        label: format(date, 'MMMM yyyy'),
        year,
        month
      });
    }
    return options;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(monthOptions[0]?.value || "");
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [activeTab, setActiveTab] = useState("products");

  // Get year and month from selection
  const { year, month } = useMemo(() => {
    if (!selectedMonth) return { year: new Date().getFullYear(), month: new Date().getMonth() + 1 };
    const [y, m] = selectedMonth.split('-').map(Number);
    return { year: y, month: m };
  }, [selectedMonth]);

  // Fetch summary
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['monthly-report-summary', year, month],
    queryFn: () => monthlyReportApi.getSummary(year, month),
    enabled: !!year && !!month
  });

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['monthly-report-products', year, month, productSearch],
    queryFn: () => monthlyReportApi.getProducts(year, month, { 
      limit: 100,
      search: productSearch || undefined
    }),
    enabled: !!year && !!month
  });

  // Fetch customers
  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ['monthly-report-customers', year, month, customerSearch],
    queryFn: () => monthlyReportApi.getCustomers(year, month, {
      limit: 100,
      search: customerSearch || undefined
    }),
    enabled: !!year && !!month
  });

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['monthly-report-categories', year, month],
    queryFn: () => monthlyReportApi.getCategories(year, month),
    enabled: !!year && !!month
  });

  // Fetch daily breakdown
  const { data: dailyData, isLoading: dailyLoading } = useQuery({
    queryKey: ['monthly-report-daily', year, month],
    queryFn: () => monthlyReportApi.getDailyBreakdown(year, month),
    enabled: !!year && !!month
  });

  const summary = summaryData?.data?.summary;
  const products = productsData?.data?.products || [];
  const productsTotals = productsData?.data?.totals;
  const customers = customersData?.data?.customers || [];
  const customersTotals = customersData?.data?.totals;
  const categories = categoriesData?.data?.categories || [];
  const daily = dailyData?.data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const periodLabel = summaryData?.data?.periodLabel || monthOptions.find(m => m.value === selectedMonth)?.label || '';

  return (
    <div className="space-y-4">
      {/* Header with Month Selector */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly Sales Report
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {periodLabel}
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
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-muted-foreground">Revenue</span>
            </div>
            <p className="text-xl font-bold mt-1">
              {summaryLoading ? <Skeleton className="h-6 w-24" /> : formatCurrency(summary?.totalRevenue || 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-muted-foreground">Profit</span>
            </div>
            <p className="text-xl font-bold mt-1">
              {summaryLoading ? <Skeleton className="h-6 w-24" /> : formatCurrency(summary?.totalProfit || 0)}
            </p>
            {summary?.profitMargin !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                {summary.profitMargin.toFixed(1)}% margin
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-medium text-muted-foreground">Orders</span>
            </div>
            <p className="text-xl font-bold mt-1">
              {summaryLoading ? <Skeleton className="h-6 w-16" /> : summary?.totalOrders || 0}
            </p>
            {summary?.averageOrderValue !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                Avg: {formatCurrency(summary.averageOrderValue)}
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-medium text-muted-foreground">Products Sold</span>
            </div>
            <p className="text-xl font-bold mt-1">
              {summaryLoading ? <Skeleton className="h-6 w-16" /> : summary?.totalProductsSold || productsTotals?.totalQuantitySold || 0}
            </p>
            {summary?.uniqueProducts !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                {summary.uniqueProducts} unique items
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-pink-600" />
              <span className="text-xs font-medium text-muted-foreground">Customers</span>
            </div>
            <p className="text-xl font-bold mt-1">
              {summaryLoading ? <Skeleton className="h-6 w-16" /> : summary?.uniqueCustomers || customersTotals?.totalCustomers || 0}
            </p>
            {customersTotals?.newCustomersThisMonth !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                {customersTotals.newCustomersThisMonth} new
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card>
        <CardContent className="pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="products" className="gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Products</span> ({products.length})
              </TabsTrigger>
              <TabsTrigger value="customers" className="gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Customers</span> ({customers.length})
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-2">
                <PieChart className="h-4 w-4" />
                <span className="hidden sm:inline">Categories</span>
              </TabsTrigger>
              <TabsTrigger value="daily" className="gap-2">
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">Daily</span>
              </TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {productsTotals && (
                  <div className="text-sm text-muted-foreground">
                    Total: {formatCurrency(productsTotals.totalRevenue)} | Profit: {formatCurrency(productsTotals.totalProfit)}
                  </div>
                )}
              </div>
              
              {productsLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No products sold in this period</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Qty Sold</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Profit</TableHead>
                        <TableHead className="text-right">Margin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product: ProductSold, index: number) => (
                        <TableRow key={product.productId || index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{product.productName}</p>
                              <p className="text-xs text-muted-foreground">{product.productSku}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.category || 'N/A'}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{product.quantitySold}</TableCell>
                          <TableCell className="text-right">{formatCurrency(product.unitPrice)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(product.totalRevenue)}</TableCell>
                          <TableCell className="text-right">
                            <span className={product.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(product.profit)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={product.profitMargin >= 5 ? 'default' : 'secondary'}>
                              {product.profitMargin?.toFixed(1) || 0}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </TabsContent>

            {/* Customers Tab */}
            <TabsContent value="customers" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {customersTotals && (
                  <div className="text-sm text-muted-foreground">
                    Total Customers: {customersTotals.totalCustomers} | Revenue: {formatCurrency(customersTotals.totalRevenue)}
                  </div>
                )}
              </div>

              {customersLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No customer purchases in this period</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead className="text-right">Total Spent</TableHead>
                        <TableHead className="text-right">Avg Order</TableHead>
                        <TableHead>Top Products</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer: CustomerPurchase, index: number) => (
                        <TableRow key={customer.customerId || index}>
                          <TableCell className="font-medium">{customer.customerName}</TableCell>
                          <TableCell className="text-muted-foreground">{customer.customerPhone || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={customer.customerType === 'business' ? 'default' : 'secondary'}>
                              {customer.customerType || 'Individual'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{customer.ordersCount}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(customer.totalSpent)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(customer.averageOrderValue)}</TableCell>
                          <TableCell className="max-w-[200px]">
                            <div className="flex flex-wrap gap-1">
                              {(customer.productsBought || []).slice(0, 2).map((product, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {product?.productName?.length > 12 
                                    ? product.productName.substring(0, 12) + '...' 
                                    : product?.productName || 'N/A'}
                                </Badge>
                              ))}
                              {(customer.productsBought || []).length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{customer.productsBought.length - 2}
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

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-4">
              {categoriesLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No category data available</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {categories.map((category: CategoryPerformance, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-semibold">
                            {category.categoryName || 'Uncategorized'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {category.productCount} products • {category.quantitySold} sold
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(category.revenue)}</p>
                          <p className="text-xs text-green-600">
                            Profit: {formatCurrency(category.profit)} ({category.profitMargin?.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={category.percentageOfTotal} className="h-2 flex-1" />
                        <span className="text-sm font-medium w-12 text-right">
                          {category.percentageOfTotal?.toFixed(1)}%
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Daily Breakdown Tab */}
            <TabsContent value="daily" className="space-y-4">
              {daily?.bestDay && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                    <div className="flex items-center gap-2 mb-1">
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Best Day</span>
                    </div>
                    <p className="text-lg font-bold">{daily.bestDay.date}</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(daily.bestDay.revenue)}</p>
                  </Card>
                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Daily Average</span>
                    </div>
                    <p className="text-lg font-bold">{daily.averageDaily?.orders?.toFixed(1)} orders</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(daily.averageDaily?.revenue || 0)}</p>
                  </Card>
                </div>
              )}

              {dailyLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !daily?.dailyData || daily.dailyData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No daily data available</p>
                </div>
              ) : (
                <ScrollArea className="h-[350px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead className="text-right">Products Sold</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Profit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {daily.dailyData.map((day: DailyData, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{day.date}</TableCell>
                          <TableCell>{day.dayOfWeek}</TableCell>
                          <TableCell className="text-right">{day.ordersCount}</TableCell>
                          <TableCell className="text-right">{day.productsSold}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(day.revenue)}</TableCell>
                          <TableCell className="text-right">
                            <span className={day.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(day.profit)}
                            </span>
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
