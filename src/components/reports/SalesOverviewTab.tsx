import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Banknote, 
  Building2 
} from "lucide-react";
import { MonthlySalesOverview } from "@/services/reportsApi";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface SalesOverviewTabProps {
  data: MonthlySalesOverview[];
  isLoading: boolean;
}

const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const getMonthName = (month: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1] || '';
};

export function SalesOverviewTab({ data, isLoading }: SalesOverviewTabProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const latestData = data[0];

  if (!latestData) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No sales overview data available
      </div>
    );
  }

  const paymentMethodData = [
    { name: 'Cash', value: latestData.cash_orders, color: 'hsl(var(--chart-1))' },
    { name: 'Credit', value: latestData.credit_orders, color: 'hsl(var(--chart-2))' },
    { name: 'Bank Transfer', value: latestData.bank_transfer_orders, color: 'hsl(var(--chart-3))' },
  ];

  const customerTypeData = [
    { name: 'Permanent', value: parseFloat(latestData.permanent_customer_revenue), color: 'hsl(var(--chart-1))' },
    { name: 'Semi-Permanent', value: parseFloat(latestData.semi_permanent_customer_revenue), color: 'hsl(var(--chart-2))' },
    { name: 'Temporary', value: parseFloat(latestData.temporary_customer_revenue), color: 'hsl(var(--chart-3))' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sales Overview</h2>
          <p className="text-muted-foreground">
            {getMonthName(latestData.month)} {latestData.year}
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {formatCurrency(latestData.total_revenue)}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestData.total_orders}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(latestData.avg_order_value)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestData.unique_customers}</div>
            <p className="text-xs text-muted-foreground">Active buyers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestData.unique_products_sold}</div>
            <p className="text-xs text-muted-foreground">
              {latestData.total_items_sold.toLocaleString()} items total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discounts Given</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(latestData.total_discount)}</div>
            <p className="text-xs text-muted-foreground">
              Tax: {formatCurrency(latestData.total_tax)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} orders`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Cash</span>
                </div>
                <span className="font-medium">{latestData.cash_orders} orders</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Credit</span>
                </div>
                <span className="font-medium">{latestData.credit_orders} orders</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Bank Transfer</span>
                </div>
                <span className="font-medium">{latestData.bank_transfer_orders} orders</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Type Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Revenue by Customer Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {customerTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Permanent</span>
                <span className="font-medium">{formatCurrency(latestData.permanent_customer_revenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Semi-Permanent</span>
                <span className="font-medium">{formatCurrency(latestData.semi_permanent_customer_revenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Temporary</span>
                <span className="font-medium">{formatCurrency(latestData.temporary_customer_revenue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
