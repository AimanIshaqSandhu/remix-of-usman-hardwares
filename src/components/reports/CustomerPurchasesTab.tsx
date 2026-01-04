import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, CreditCard, Banknote, Building2, AlertCircle } from "lucide-react";
import { MonthlyCustomerPurchase } from "@/services/reportsApi";
import { format } from "date-fns";

interface CustomerPurchasesTabProps {
  data: MonthlyCustomerPurchase[];
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

const getCustomerTypeBadgeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'permanent':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'semi-permanent':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'temporary':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    default:
      return '';
  }
};

export function CustomerPurchasesTab({ data, isLoading }: CustomerPurchasesTabProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("value");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No customer purchases data available
      </div>
    );
  }

  const types = [...new Set(data.map(c => c.customer_type))];

  const filteredData = data
    .filter(c => 
      (typeFilter === "all" || c.customer_type === typeFilter) &&
      (c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
       c.customer_phone.includes(search))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "value":
          return parseFloat(b.total_purchase_value) - parseFloat(a.total_purchase_value);
        case "orders":
          return b.times_purchased - a.times_purchased;
        case "balance":
          return parseFloat(b.outstanding_balance) - parseFloat(a.outstanding_balance);
        default:
          return 0;
      }
    });

  const totalPurchases = filteredData.reduce((sum, c) => sum + parseFloat(c.total_purchase_value), 0);
  const totalOutstanding = filteredData.reduce((sum, c) => sum + parseFloat(c.outstanding_balance), 0);
  const totalCash = filteredData.reduce((sum, c) => sum + parseFloat(c.cash_purchases), 0);
  const totalCredit = filteredData.reduce((sum, c) => sum + parseFloat(c.credit_purchases), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Customer Purchases</h2>
          <p className="text-muted-foreground">
            {data[0] ? `${getMonthName(data[0].month)} ${data[0].year}` : 'Current Month'}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Users className="h-3 w-3 mr-1" />
            {filteredData.length} Customers
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPurchases)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Sales</CardTitle>
            <Banknote className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCash)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalCredit)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalOutstanding)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Customer Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="value">Purchase Value</SelectItem>
                <SelectItem value="orders">Orders</SelectItem>
                <SelectItem value="balance">Outstanding</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Cash</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Bank</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((customer) => (
                  <TableRow key={`${customer.customer_id}-${customer.month}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.customer_name}</div>
                        <div className="text-sm text-muted-foreground">{customer.customer_phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCustomerTypeBadgeColor(customer.customer_type)}>
                        {customer.customer_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{customer.times_purchased}</TableCell>
                    <TableCell className="text-right">{customer.total_items_purchased.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(customer.cash_purchases)}</TableCell>
                    <TableCell className="text-right text-blue-600">{formatCurrency(customer.credit_purchases)}</TableCell>
                    <TableCell className="text-right text-purple-600">{formatCurrency(customer.bank_purchases)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(customer.total_purchase_value)}</TableCell>
                    <TableCell className="text-right">
                      <span className={parseFloat(customer.outstanding_balance) > 0 ? 'text-orange-600 font-medium' : ''}>
                        {formatCurrency(customer.outstanding_balance)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
