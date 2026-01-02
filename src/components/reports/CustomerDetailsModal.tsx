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
  User,
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Wallet,
  Star,
  Clock,
  Activity,
  BarChart3,
  Receipt,
  ArrowUpRight,
  Heart,
  Award,
  Hash,
} from "lucide-react";
import { salesApi, customersApi } from "@/services/api";

interface Customer {
  id: number | string;
  name: string;
  email?: string;
  phone?: string;
  type?: string;
  balance?: number;
  currentBalance?: number;
  totalOrders?: number;
  totalPurchases?: number;
  address?: string;
  city?: string;
  createdAt?: string;
  lastPurchase?: string;
  creditLimit?: number;
  status?: string;
}

interface CustomerDetailsModalProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OrderItem {
  id: number;
  orderNumber: string;
  date: string;
  items: Array<{
    productName: string;
    productId?: number;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  total: number;
  status: string;
  paymentMethod: string;
  itemCount: number;
}

interface FavoriteProduct {
  name: string;
  productId?: number;
  count: number;
  totalQty: number;
  totalSpent: number;
}

const CustomerDetailsModal = ({ customer, open, onOpenChange }: CustomerDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch customer details
  const { data: customerDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['customer-details', customer?.id],
    queryFn: async () => {
      if (!customer?.id) return null;
      const customerId = typeof customer.id === 'string' ? parseInt(customer.id, 10) : customer.id;
      const response = await customersApi.getById(customerId);
      return response.success ? response.data : customer;
    },
    enabled: !!customer?.id && open,
  });

  // Fetch order history for this customer
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['customer-orders', customer?.id],
    queryFn: async () => {
      const customerId = typeof customer?.id === 'string' ? parseInt(customer.id, 10) : customer?.id;
      const response = await salesApi.getAll({ customerId, limit: 10000 });
      if (response.success && response.data) {
        const allOrders = response.data.sales || response.data || [];
        
        let totalSpent = 0;
        let totalItems = 0;
        const productStats = new Map<string, FavoriteProduct>();
        const monthlySpending: Record<string, { orders: number; amount: number }> = {};
        const paymentMethods: Record<string, number> = {};
        
        const orders: OrderItem[] = allOrders.map((order: any) => {
          const items = (order.items || order.saleItems || []).map((item: any) => {
            const productName = item.productName || item.product_name || item.product?.name || 'Unknown';
            const productId = item.productId || item.product_id || item.product?.id;
            const quantity = parseFloat(item.quantity) || 0;
            const unitPrice = parseFloat(item.unitPrice || item.unit_price || item.price) || 0;
            const total = parseFloat(item.total || item.subtotal) || 0;
            
            totalItems += quantity;
            
            // Track product stats
            const key = productName;
            const existing = productStats.get(key) || { 
              name: productName, 
              productId,
              count: 0, 
              totalQty: 0, 
              totalSpent: 0 
            };
            productStats.set(key, {
              ...existing,
              count: existing.count + 1,
              totalQty: existing.totalQty + quantity,
              totalSpent: existing.totalSpent + total,
            });
            
            return {
              productName,
              productId,
              quantity,
              unitPrice,
              total,
            };
          });

          const orderTotal = parseFloat(order.total || order.grandTotal || order.grand_total) || 0;
          totalSpent += orderTotal;

          const date = order.date || order.created_at || order.createdAt;
          const paymentMethod = order.paymentMethod || order.payment_method || 'cash';
          
          // Track monthly spending
          const month = new Date(date).toISOString().slice(0, 7);
          if (!monthlySpending[month]) {
            monthlySpending[month] = { orders: 0, amount: 0 };
          }
          monthlySpending[month].orders += 1;
          monthlySpending[month].amount += orderTotal;

          // Track payment methods
          paymentMethods[paymentMethod] = (paymentMethods[paymentMethod] || 0) + 1;

          return {
            id: order.id,
            orderNumber: order.orderNumber || order.order_number || `ORD-${order.id}`,
            date,
            items,
            total: orderTotal,
            status: order.status || 'completed',
            paymentMethod,
            itemCount: items.length,
          };
        });

        // Get favorite products (most purchased)
        const favoriteProducts = Array.from(productStats.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        const sortedMonthlySpending = Object.entries(monthlySpending)
          .sort(([a], [b]) => b.localeCompare(a))
          .slice(0, 6);

        return {
          orders: orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
          favoriteProducts,
          monthlySpending: sortedMonthlySpending,
          paymentMethods,
          summary: {
            totalOrders: orders.length,
            totalSpent,
            totalItems,
            avgOrderValue: orders.length > 0 ? totalSpent / orders.length : 0,
            avgItemsPerOrder: orders.length > 0 ? totalItems / orders.length : 0,
            uniqueProducts: productStats.size,
          },
        };
      }
      return { 
        orders: [], 
        favoriteProducts: [],
        monthlySpending: [],
        paymentMethods: {},
        summary: { totalOrders: 0, totalSpent: 0, totalItems: 0, avgOrderValue: 0, avgItemsPerOrder: 0, uniqueProducts: 0 } 
      };
    },
    enabled: !!customer?.id && open,
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

  if (!customer) return null;

  const mergedCustomer = { ...customer, ...customerDetails };
  const balance = mergedCustomer.currentBalance || mergedCustomer.balance || 0;
  const isLoyal = (ordersData?.summary.totalOrders || 0) >= 10;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl lg:max-w-4xl p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b">
          <SheetHeader>
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-2xl font-bold truncate">{mergedCustomer.name}</SheetTitle>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant={mergedCustomer.type === "business" ? "default" : "secondary"}>
                    {mergedCustomer.type || "Individual"}
                  </Badge>
                  <Badge variant={mergedCustomer.status === 'active' ? 'outline' : 'destructive'}>
                    {mergedCustomer.status || 'active'}
                  </Badge>
                  {isLoyal && (
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                      <Star className="h-3 w-3 mr-1 fill-amber-500" />
                      Loyal Customer
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            <div className="bg-background/80 backdrop-blur rounded-xl p-3 text-center">
              {ordersLoading ? (
                <Skeleton className="h-8 w-12 mx-auto" />
              ) : (
                <p className="text-2xl font-bold text-primary">{ordersData?.summary.totalOrders || 0}</p>
              )}
              <p className="text-xs text-muted-foreground">Orders</p>
            </div>
            <div className="bg-background/80 backdrop-blur rounded-xl p-3 text-center">
              {ordersLoading ? (
                <Skeleton className="h-8 w-20 mx-auto" />
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(ordersData?.summary.totalSpent || mergedCustomer.totalPurchases || 0)}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </div>
            <div className="bg-background/80 backdrop-blur rounded-xl p-3 text-center">
              {ordersLoading ? (
                <Skeleton className="h-8 w-16 mx-auto" />
              ) : (
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(ordersData?.summary.avgOrderValue || 0)}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Avg Order</p>
            </div>
            <div className="bg-background/80 backdrop-blur rounded-xl p-3 text-center">
              <p className={`text-2xl font-bold ${balance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                {formatCurrency(Math.abs(balance))}
              </p>
              <p className="text-xs text-muted-foreground">{balance > 0 ? 'Balance Due' : 'Clear'}</p>
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
              <TabsTrigger value="orders" className="data-[state=active]:bg-primary/10">
                <Receipt className="h-4 w-4 mr-2" />
                Orders ({ordersData?.summary.totalOrders || 0})
              </TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-primary/10">
                <Heart className="h-4 w-4 mr-2" />
                Favorites ({ordersData?.favoriteProducts.length || 0})
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[calc(100vh-320px)]">
            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6 space-y-6 mt-0">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <ContactCard icon={Phone} label="Phone" value={mergedCustomer.phone || 'N/A'} />
                  <ContactCard icon={Mail} label="Email" value={mergedCustomer.email || 'N/A'} />
                  <ContactCard icon={MapPin} label="City" value={mergedCustomer.city || 'N/A'} />
                  <ContactCard icon={MapPin} label="Address" value={mergedCustomer.address || 'N/A'} />
                  <ContactCard icon={Calendar} label="Customer Since" value={formatDate(mergedCustomer.createdAt || '')} />
                  <ContactCard icon={Clock} label="Last Purchase" value={formatDate(mergedCustomer.lastPurchase || '')} />
                </div>
              </div>

              <Separator />

              {/* Financial Overview */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Financial Overview
                </h3>
                {ordersLoading ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      icon={DollarSign}
                      label="Total Spent"
                      value={formatCurrency(ordersData?.summary.totalSpent || mergedCustomer.totalPurchases || 0)}
                      color="green"
                    />
                    <StatCard
                      icon={Wallet}
                      label="Current Balance"
                      value={formatCurrency(Math.abs(balance))}
                      color={balance > 0 ? 'red' : 'blue'}
                      subtext={balance > 0 ? 'Outstanding' : 'Clear'}
                    />
                    <StatCard
                      icon={CreditCard}
                      label="Credit Limit"
                      value={formatCurrency(mergedCustomer.creditLimit || 0)}
                      color="purple"
                    />
                    <StatCard
                      icon={TrendingUp}
                      label="Avg Order Value"
                      value={formatCurrency(ordersData?.summary.avgOrderValue || 0)}
                      color="blue"
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Shopping Statistics */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Shopping Statistics
                </h3>
                {ordersLoading ? (
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
                      value={ordersData?.summary.totalOrders || 0}
                      color="blue"
                    />
                    <StatCard
                      icon={Package}
                      label="Items Purchased"
                      value={ordersData?.summary.totalItems || 0}
                      color="green"
                    />
                    <StatCard
                      icon={Hash}
                      label="Unique Products"
                      value={ordersData?.summary.uniqueProducts || 0}
                      color="purple"
                    />
                    <StatCard
                      icon={BarChart3}
                      label="Avg Items/Order"
                      value={(ordersData?.summary.avgItemsPerOrder || 0).toFixed(1)}
                      color="emerald"
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Monthly Spending */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Monthly Spending History
                </h3>
                {ordersLoading ? (
                  <Skeleton className="h-32 rounded-xl" />
                ) : ordersData?.monthlySpending.length ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {ordersData.monthlySpending.map(([month, data]) => (
                      <div key={month} className="bg-muted/50 rounded-xl p-4 border">
                        <p className="text-sm font-medium text-muted-foreground">{formatMonth(month)}</p>
                        <div className="flex items-baseline justify-between mt-2">
                          <p className="text-xl font-bold text-green-600">{formatCurrency(data.amount)}</p>
                          <p className="text-sm text-muted-foreground">{data.orders} orders</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-xl">
                    No spending history available
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              {ordersData?.paymentMethods && Object.keys(ordersData.paymentMethods).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Payment Preferences
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(ordersData.paymentMethods).map(([method, count]) => (
                        <div key={method} className="bg-muted/50 rounded-lg px-4 py-2 border">
                          <span className="capitalize font-medium">{method}</span>
                          <span className="text-muted-foreground ml-2">({count} orders)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="p-6 mt-0">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Complete Order History
              </h3>
              {ordersLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : ordersData?.orders.length ? (
                <div className="space-y-3">
                  {ordersData.orders.map((order) => (
                    <div 
                      key={order.id}
                      className="bg-muted/30 rounded-xl p-4 border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-mono font-semibold text-lg">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(order.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">{formatCurrency(order.total)}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={order.status === 'completed' ? 'secondary' : 'outline'}>
                              {order.status}
                            </Badge>
                            <Badge variant="outline" className="capitalize">{order.paymentMethod}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="text-sm font-medium mb-2">{order.items.length} items:</p>
                        <div className="flex flex-wrap gap-2">
                          {order.items.slice(0, 5).map((item, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {item.productName} x{item.quantity}
                            </Badge>
                          ))}
                          {order.items.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{order.items.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={ShoppingCart} message="No order history for this customer" />
              )}
            </TabsContent>

            {/* Favorite Products Tab */}
            <TabsContent value="products" className="p-6 mt-0">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Favorite Products
              </h3>
              {ordersLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              ) : ordersData?.favoriteProducts.length ? (
                <div className="space-y-3">
                  {ordersData.favoriteProducts.map((product, idx) => (
                    <div 
                      key={product.name}
                      className="bg-muted/30 rounded-xl p-4 border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                            idx === 0 ? 'bg-amber-500/20 text-amber-600' :
                            idx === 1 ? 'bg-slate-400/20 text-slate-600' :
                            idx === 2 ? 'bg-orange-600/20 text-orange-700' :
                            'bg-primary/10 text-primary'
                          }`}>
                            {idx < 3 ? <Award className="h-5 w-5" /> : idx + 1}
                          </div>
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Purchased {product.count} time{product.count > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{formatCurrency(product.totalSpent)}</p>
                          <p className="text-sm text-muted-foreground">{product.totalQty} units total</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Package} message="No product purchase history" />
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

// Helper Components
const ContactCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="bg-muted/30 rounded-xl p-4 border">
    <div className="flex items-center gap-2 text-muted-foreground mb-1">
      <Icon className="h-4 w-4" />
      <span className="text-xs font-medium">{label}</span>
    </div>
    <p className="font-semibold truncate">{value}</p>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color, subtext }: { 
  icon: any; 
  label: string; 
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'emerald' | 'red';
  subtext?: string;
}) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    green: 'bg-green-500/10 text-green-600 border-green-500/20',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    red: 'bg-destructive/10 text-destructive border-destructive/20',
  };
  
  return (
    <div className={`rounded-xl p-4 border ${colorClasses[color]}`}>
      <Icon className="h-5 w-5 mb-2" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
      {subtext && <p className="text-xs opacity-60 mt-1">{subtext}</p>}
    </div>
  );
};

const EmptyState = ({ icon: Icon, message }: { icon: any; message: string }) => (
  <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-xl border-2 border-dashed">
    <Icon className="h-12 w-12 mx-auto mb-3 opacity-50" />
    <p>{message}</p>
  </div>
);

export default CustomerDetailsModal;
