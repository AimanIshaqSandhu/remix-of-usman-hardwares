import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Calendar,
  BarChart3,
  Layers,
  Tag,
  Hash,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Box,
  Activity,
  Target,
  Zap,
} from "lucide-react";
import { salesApi } from "@/services/api";

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStock?: number;
  maxStock?: number;
  unit?: string;
  cost?: number;
  description?: string;
  barcode?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  supplier?: { id: number; name: string };
}

interface ProductDetailsModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SaleItem {
  id: number;
  orderNumber: string;
  customerName: string;
  customerId?: number;
  quantity: number;
  unitPrice: number;
  total: number;
  date: string;
  status: string;
}

interface CustomerBuyerData {
  name: string;
  totalQuantity: number;
  totalSpent: number;
  orderCount: number;
  lastPurchase: string;
}

const ProductDetailsModal = ({ product, open, onOpenChange }: ProductDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch sales history for this product
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['product-sales-history', product?.id],
    queryFn: async () => {
      const response = await salesApi.getAll({ limit: 10000 });
      if (response.success && response.data) {
        const allSales = response.data.sales || response.data || [];
        const productSales: SaleItem[] = [];
        let totalSold = 0;
        let totalRevenue = 0;
        let totalProfit = 0;
        const customerMap = new Map<string, CustomerBuyerData>();
        const monthlySales: Record<string, { qty: number; revenue: number }> = {};

        allSales.forEach((sale: any) => {
          const items = sale.items || sale.saleItems || [];
          items.forEach((item: any) => {
            if (item.productId === product?.id || item.product_id === product?.id) {
              const quantity = parseFloat(item.quantity) || 0;
              const unitPrice = parseFloat(item.unitPrice || item.unit_price || item.price) || 0;
              const total = parseFloat(item.total || item.subtotal) || quantity * unitPrice;
              const customerName = sale.customerName || sale.customer_name || sale.customer?.name || 'Walk-in';
              const date = sale.date || sale.created_at || sale.createdAt;
              
              productSales.push({
                id: sale.id,
                orderNumber: sale.orderNumber || sale.order_number || `ORD-${sale.id}`,
                customerName,
                customerId: sale.customerId || sale.customer_id || sale.customer?.id,
                quantity,
                unitPrice,
                total,
                date,
                status: sale.status || 'completed',
              });
              
              totalSold += quantity;
              totalRevenue += total;
              
              // Calculate profit if cost is available
              if (product?.costPrice || product?.cost) {
                const cost = product.costPrice || product.cost || 0;
                totalProfit += (unitPrice - cost) * quantity;
              }

              // Track customer purchases
              const existing = customerMap.get(customerName) || {
                name: customerName,
                totalQuantity: 0,
                totalSpent: 0,
                orderCount: 0,
                lastPurchase: date,
              };
              customerMap.set(customerName, {
                ...existing,
                totalQuantity: existing.totalQuantity + quantity,
                totalSpent: existing.totalSpent + total,
                orderCount: existing.orderCount + 1,
                lastPurchase: new Date(date) > new Date(existing.lastPurchase) ? date : existing.lastPurchase,
              });

              // Track monthly sales
              const month = new Date(date).toISOString().slice(0, 7);
              if (!monthlySales[month]) {
                monthlySales[month] = { qty: 0, revenue: 0 };
              }
              monthlySales[month].qty += quantity;
              monthlySales[month].revenue += total;
            }
          });
        });

        const customers = Array.from(customerMap.values())
          .sort((a, b) => b.totalSpent - a.totalSpent);

        return {
          sales: productSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
          customers,
          monthlySales: Object.entries(monthlySales)
            .sort(([a], [b]) => b.localeCompare(a))
            .slice(0, 6),
          summary: {
            totalSold,
            totalRevenue,
            totalProfit,
            uniqueCustomers: customerMap.size,
            avgQuantityPerOrder: productSales.length > 0 ? totalSold / productSales.length : 0,
            avgOrderValue: productSales.length > 0 ? totalRevenue / productSales.length : 0,
            totalOrders: productSales.length,
          },
        };
      }
      return { 
        sales: [], 
        customers: [],
        monthlySales: [],
        summary: { totalSold: 0, totalRevenue: 0, totalProfit: 0, uniqueCustomers: 0, avgQuantityPerOrder: 0, avgOrderValue: 0, totalOrders: 0 } 
      };
    },
    enabled: !!product?.id && open,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-PK', { month: 'short', year: 'numeric' });
  };

  const getStockStatus = (stock: number, minStock: number = 5) => {
    if (stock <= 0) return { label: "Out of Stock", variant: "destructive" as const, color: "bg-destructive/10 text-destructive" };
    if (stock <= minStock) return { label: "Low Stock", variant: "outline" as const, color: "bg-orange-500/10 text-orange-600" };
    return { label: "In Stock", variant: "secondary" as const, color: "bg-green-500/10 text-green-600" };
  };

  if (!product) return null;

  const stockStatus = getStockStatus(product.stock, product.minStock);
  const profitMargin = product.costPrice || product.cost 
    ? ((product.price - (product.costPrice || product.cost || 0)) / product.price * 100)
    : null;
  const profitPerUnit = product.costPrice || product.cost 
    ? product.price - (product.costPrice || product.cost || 0)
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl lg:max-w-4xl p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b">
          <SheetHeader>
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-2xl font-bold truncate">{product.name}</SheetTitle>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="outline" className="font-mono text-xs">{product.sku}</Badge>
                  <Badge variant="secondary">{product.category || 'Uncategorized'}</Badge>
                  <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            <div className="bg-background/80 backdrop-blur rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-primary">{formatCurrency(product.price)}</p>
              <p className="text-xs text-muted-foreground">Selling Price</p>
            </div>
            <div className="bg-background/80 backdrop-blur rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{product.stock}</p>
              <p className="text-xs text-muted-foreground">In Stock</p>
            </div>
            <div className="bg-background/80 backdrop-blur rounded-xl p-3 text-center">
              {salesLoading ? (
                <Skeleton className="h-8 w-16 mx-auto" />
              ) : (
                <p className="text-2xl font-bold text-green-600">{salesData?.summary.totalSold || 0}</p>
              )}
              <p className="text-xs text-muted-foreground">Total Sold</p>
            </div>
            <div className="bg-background/80 backdrop-blur rounded-xl p-3 text-center">
              {salesLoading ? (
                <Skeleton className="h-8 w-20 mx-auto" />
              ) : (
                <p className="text-2xl font-bold text-blue-600">{salesData?.summary.uniqueCustomers || 0}</p>
              )}
              <p className="text-xs text-muted-foreground">Customers</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="border-b px-6">
            <TabsList className="h-12 bg-transparent gap-4">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10">
                <Activity className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="sales" className="data-[state=active]:bg-primary/10">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Sales ({salesData?.summary.totalOrders || 0})
              </TabsTrigger>
              <TabsTrigger value="customers" className="data-[state=active]:bg-primary/10">
                <Users className="h-4 w-4 mr-2" />
                Buyers ({salesData?.summary.uniqueCustomers || 0})
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[calc(100vh-320px)]">
            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6 space-y-6 mt-0">
              {/* Product Details Grid */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Box className="h-5 w-5 text-primary" />
                  Product Information
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoCard icon={Hash} label="SKU" value={product.sku} />
                  <InfoCard icon={Tag} label="Category" value={product.category || 'N/A'} />
                  <InfoCard icon={DollarSign} label="Selling Price" value={formatCurrency(product.price)} highlight />
                  <InfoCard icon={DollarSign} label="Cost Price" value={formatCurrency(product.costPrice || product.cost || 0)} />
                  <InfoCard 
                    icon={Percent} 
                    label="Profit Margin" 
                    value={profitMargin ? `${profitMargin.toFixed(1)}%` : 'N/A'} 
                    highlight={profitMargin !== null && profitMargin > 0}
                  />
                  <InfoCard 
                    icon={TrendingUp} 
                    label="Profit Per Unit" 
                    value={profitPerUnit ? formatCurrency(profitPerUnit) : 'N/A'} 
                    highlight={profitPerUnit !== null && profitPerUnit > 0}
                  />
                  <InfoCard icon={Layers} label="Current Stock" value={`${product.stock} ${product.unit || 'pcs'}`} />
                  <InfoCard icon={Target} label="Min Stock" value={`${product.minStock || 5} ${product.unit || 'pcs'}`} />
                  <InfoCard icon={Zap} label="Max Stock" value={`${product.maxStock || 100} ${product.unit || 'pcs'}`} />
                  <InfoCard icon={Calendar} label="Created" value={formatDate(product.createdAt || '')} />
                  <InfoCard icon={Clock} label="Last Updated" value={formatDate(product.updatedAt || '')} />
                  <InfoCard icon={Package} label="Supplier" value={product.supplier?.name || 'N/A'} />
                </div>
              </div>

              <Separator />

              {/* Sales Performance */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Sales Performance
                </h3>
                {salesLoading ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      icon={ShoppingCart}
                      label="Total Orders"
                      value={salesData?.summary.totalOrders || 0}
                      color="blue"
                    />
                    <StatCard
                      icon={Box}
                      label="Units Sold"
                      value={salesData?.summary.totalSold || 0}
                      color="green"
                    />
                    <StatCard
                      icon={DollarSign}
                      label="Total Revenue"
                      value={formatCurrency(salesData?.summary.totalRevenue || 0)}
                      color="purple"
                    />
                    <StatCard
                      icon={TrendingUp}
                      label="Total Profit"
                      value={formatCurrency(salesData?.summary.totalProfit || 0)}
                      color="emerald"
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Monthly Performance */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Monthly Performance
                </h3>
                {salesLoading ? (
                  <Skeleton className="h-32 rounded-xl" />
                ) : salesData?.monthlySales.length ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {salesData.monthlySales.map(([month, data]) => (
                      <div key={month} className="bg-muted/50 rounded-xl p-4 border">
                        <p className="text-sm font-medium text-muted-foreground">{formatMonth(month)}</p>
                        <div className="flex items-baseline justify-between mt-2">
                          <p className="text-xl font-bold">{data.qty} units</p>
                          <p className="text-sm text-green-600 font-medium">{formatCurrency(data.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-xl">
                    No sales data available
                  </div>
                )}
              </div>

              {/* Additional Stats */}
              {!salesLoading && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Additional Metrics
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      <InfoCard 
                        icon={BarChart3} 
                        label="Avg Qty Per Order" 
                        value={(salesData?.summary.avgQuantityPerOrder || 0).toFixed(1)} 
                      />
                      <InfoCard 
                        icon={DollarSign} 
                        label="Avg Order Value" 
                        value={formatCurrency(salesData?.summary.avgOrderValue || 0)} 
                      />
                      <InfoCard 
                        icon={Users} 
                        label="Repeat Customers" 
                        value={salesData?.customers.filter(c => c.orderCount > 1).length || 0} 
                      />
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Sales History Tab */}
            <TabsContent value="sales" className="p-6 mt-0">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Complete Sales History
              </h3>
              {salesLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : salesData?.sales.length ? (
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Order #</TableHead>
                        <TableHead className="font-semibold">Customer</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="text-right font-semibold">Qty</TableHead>
                        <TableHead className="text-right font-semibold">Price</TableHead>
                        <TableHead className="text-right font-semibold">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesData.sales.map((sale, idx) => (
                        <TableRow key={`${sale.id}-${idx}`} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-sm">{sale.orderNumber}</TableCell>
                          <TableCell className="font-medium">{sale.customerName}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(sale.date)}</TableCell>
                          <TableCell className="text-right">{sale.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(sale.unitPrice)}</TableCell>
                          <TableCell className="text-right font-semibold text-green-600">{formatCurrency(sale.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <EmptyState icon={ShoppingCart} message="No sales history for this product" />
              )}
            </TabsContent>

            {/* Customers Tab */}
            <TabsContent value="customers" className="p-6 mt-0">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Customers Who Purchased
              </h3>
              {salesLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              ) : salesData?.customers.length ? (
                <div className="space-y-3">
                  {salesData.customers.map((customer, idx) => (
                    <div 
                      key={customer.name}
                      className="bg-muted/30 rounded-xl p-4 border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-semibold">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {customer.orderCount} order{customer.orderCount > 1 ? 's' : ''} • Last: {formatDate(customer.lastPurchase)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{formatCurrency(customer.totalSpent)}</p>
                          <p className="text-sm text-muted-foreground">{customer.totalQuantity} units</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Users} message="No customers have purchased this product yet" />
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

// Helper Components
const InfoCard = ({ icon: Icon, label, value, highlight = false }: { 
  icon: any; 
  label: string; 
  value: string | number;
  highlight?: boolean;
}) => (
  <div className="bg-muted/30 rounded-xl p-4 border">
    <div className="flex items-center gap-2 text-muted-foreground mb-1">
      <Icon className="h-4 w-4" />
      <span className="text-xs font-medium">{label}</span>
    </div>
    <p className={`text-lg font-semibold truncate ${highlight ? 'text-green-600' : ''}`}>{value}</p>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color }: { 
  icon: any; 
  label: string; 
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'emerald';
}) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    green: 'bg-green-500/10 text-green-600 border-green-500/20',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  };
  
  return (
    <div className={`rounded-xl p-4 border ${colorClasses[color]}`}>
      <Icon className="h-5 w-5 mb-2" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
};

const EmptyState = ({ icon: Icon, message }: { icon: any; message: string }) => (
  <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-xl border-2 border-dashed">
    <Icon className="h-12 w-12 mx-auto mb-3 opacity-50" />
    <p>{message}</p>
  </div>
);

export default ProductDetailsModal;
