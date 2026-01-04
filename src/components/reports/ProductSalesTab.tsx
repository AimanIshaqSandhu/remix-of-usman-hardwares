import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { MonthlyProductSale } from "@/services/reportsApi";

interface ProductSalesTabProps {
  data: MonthlyProductSale[];
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

export function ProductSalesTab({ data, isLoading }: ProductSalesTabProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("revenue");

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
        No product sales data available
      </div>
    );
  }

  const categories = [...new Set(data.map(p => p.category_name))];

  const filteredData = data
    .filter(p => 
      (categoryFilter === "all" || p.category_name === categoryFilter) &&
      (p.product_name.toLowerCase().includes(search.toLowerCase()) ||
       p.sku.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "revenue":
          return parseFloat(b.total_revenue) - parseFloat(a.total_revenue);
        case "profit":
          return parseFloat(b.total_profit) - parseFloat(a.total_profit);
        case "quantity":
          return b.total_quantity_sold - a.total_quantity_sold;
        case "margin":
          return b.profit_margin_percent - a.profit_margin_percent;
        default:
          return 0;
      }
    });

  const totalRevenue = filteredData.reduce((sum, p) => sum + parseFloat(p.total_revenue), 0);
  const totalProfit = filteredData.reduce((sum, p) => sum + parseFloat(p.total_profit), 0);
  const avgMargin = filteredData.reduce((sum, p) => sum + p.profit_margin_percent, 0) / (filteredData.length || 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Product Sales</h2>
          <p className="text-muted-foreground">
            {data[0] ? `${getMonthName(data[0].month)} ${data[0].year}` : 'Current Month'}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Package className="h-3 w-3 mr-1" />
            {filteredData.length} Products
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMargin.toFixed(1)}%</div>
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
                placeholder="Search by name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="profit">Profit</SelectItem>
                <SelectItem value="quantity">Quantity</SelectItem>
                <SelectItem value="margin">Margin %</SelectItem>
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
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Qty Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((product) => (
                  <TableRow key={`${product.product_id}-${product.month}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{product.product_name}</span>
                        {product.product_status !== 'active' && (
                          <Badge variant="outline" className="text-xs">
                            {product.product_status}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category_name}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(product.current_price)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatCurrency(product.current_cost)}</TableCell>
                    <TableCell className="text-right">
                      {product.total_quantity_sold.toLocaleString()} {product.unit}
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(product.total_revenue)}</TableCell>
                    <TableCell className="text-right">
                      <span className={parseFloat(product.total_profit) >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(product.total_profit)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {product.profit_margin_percent >= 20 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-orange-500" />
                        )}
                        <span>{product.profit_margin_percent.toFixed(1)}%</span>
                      </div>
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
