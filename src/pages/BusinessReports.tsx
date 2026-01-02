import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { productsApi, customersApi } from "@/services/api";
import { reportsApi } from "@/services/reportsApi";
import ProductDetailsModal from "@/components/reports/ProductDetailsModal";
import CustomerDetailsModal from "@/components/reports/CustomerDetailsModal";
import {
  Package,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  Search,
  RefreshCw,
  FileText,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import MonthlyReportTab from "@/components/reports/MonthlyReportTab";

// Types
interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  minStock?: number;
  unit?: string;
}

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  type?: string;
  balance?: number;
  totalOrders?: number;
}

const BusinessReports = () => {
  const { toast } = useToast();
  const [searchProducts, setSearchProducts] = useState("");
  const [searchCustomers, setSearchCustomers] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

  // Fetch all products
  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['reports-all-products'],
    queryFn: async () => {
      const response = await productsApi.getAll({ limit: 10000 });
      return response.success ? (response.data?.products || response.data || []) : [];
    },
  });

  // Fetch all customers
  const { data: customersData, isLoading: customersLoading, refetch: refetchCustomers } = useQuery({
    queryKey: ['reports-all-customers'],
    queryFn: async () => {
      const response = await customersApi.getAll({ limit: 10000 });
      return response.success ? (response.data?.customers || response.data || []) : [];
    },
  });

  // Fetch inventory report for fast/slow moving items
  const { data: inventoryReportData, isLoading: inventoryLoading, refetch: refetchInventory } = useQuery({
    queryKey: ['reports-inventory'],
    queryFn: reportsApi.getInventoryReport,
  });

  // Get unique categories from products
  const categories: string[] = Array.from(new Set((productsData || []).map((p: Product) => p.category).filter((c): c is string => Boolean(c))));

  // Filter products
  const filteredProducts = (productsData || []).filter((product: Product) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchProducts.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchProducts.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter customers
  const filteredCustomers = (customersData || []).filter((customer: Customer) => {
    return customer.name?.toLowerCase().includes(searchCustomers.toLowerCase()) ||
      customer.phone?.includes(searchCustomers) ||
      customer.email?.toLowerCase().includes(searchCustomers.toLowerCase());
  });

  // Get fast and slow moving products from inventory report
  const fastMovingProducts = inventoryReportData?.data?.inventoryReport?.fastMovingItems || [];
  const slowMovingProducts = inventoryReportData?.data?.inventoryReport?.slowMovingItems || [];
  const lowStockProducts = inventoryReportData?.data?.inventoryReport?.lowStockItems || [];

  const handleRefreshAll = () => {
    refetchProducts();
    refetchCustomers();
    refetchInventory();
    toast({
      title: "Refreshed",
      description: "All reports data has been refreshed",
    });
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num || 0);
  };

  const getStockStatus = (stock: number, minStock: number = 5) => {
    if (stock <= 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (stock <= minStock) return { label: "Low Stock", variant: "outline" as const };
    return { label: "In Stock", variant: "secondary" as const };
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Business Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            View all products, customers, and sales reports
          </p>
        </div>
        <Button onClick={handleRefreshAll} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh All
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">All Products</span>
            <span className="sm:hidden">Products</span>
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">All Customers</span>
            <span className="sm:hidden">Customers</span>
          </TabsTrigger>
          <TabsTrigger value="monthly" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Monthly Report</span>
            <span className="sm:hidden">Monthly</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Inventory Analysis</span>
            <span className="sm:hidden">Inventory</span>
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  All Products ({filteredProducts.length})
                </CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchProducts}
                      onChange={(e) => setSearchProducts(e.target.value)}
                      className="pl-9 w-[200px]"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product: Product) => {
                        const stockStatus = getStockStatus(product.stock, product.minStock);
                        return (
                          <TableRow 
                            key={product.id}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => {
                              setSelectedProduct(product);
                              setProductModalOpen(true);
                            }}
                          >
                            <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {product.name}
                                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{product.category || "N/A"}</Badge>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                            <TableCell className="text-right">
                              {product.stock} {product.unit || "pcs"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Customers ({filteredCustomers.length})
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    value={searchCustomers}
                    onChange={(e) => setSearchCustomers(e.target.value)}
                    className="pl-9 w-[250px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {customersLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer: Customer) => (
                        <TableRow 
                          key={customer.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setCustomerModalOpen(true);
                          }}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {customer.name}
                              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                            </div>
                          </TableCell>
                          <TableCell>{customer.phone || "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{customer.email || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={customer.type === "business" ? "default" : "secondary"}>
                              {customer.type || "Individual"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {customer.balance ? formatCurrency(customer.balance) : "—"}
                          </TableCell>
                          <TableCell className="text-right">{customer.totalOrders || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Report Tab */}
        <TabsContent value="monthly" className="space-y-4">
          <MonthlyReportTab />
        </TabsContent>

        {/* Inventory Analysis Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Fast Moving Products */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Top Selling Products
                  <Badge variant="secondary" className="ml-2">{fastMovingProducts.length}</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">Products with highest sales volume</p>
              </CardHeader>
              <CardContent>
                {inventoryLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : fastMovingProducts.length > 0 ? (
                  <ScrollArea className="h-[350px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Qty Sold</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fastMovingProducts.map((item: any, index: number) => (
                          <TableRow key={item.productId || index}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                  {index + 1}
                                </span>
                                {item.productName}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{item.soldQuantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No fast moving products data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Slow Moving Products */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-orange-600" />
                  Slow Moving Products
                  <Badge variant="secondary" className="ml-2">{slowMovingProducts.length}</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">Products that need attention</p>
              </CardHeader>
              <CardContent>
                {inventoryLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : slowMovingProducts.length > 0 ? (
                  <ScrollArea className="h-[350px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Qty Sold</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {slowMovingProducts.map((item: any, index: number) => (
                          <TableRow key={item.productId || index}>
                            <TableCell className="font-medium">{item.productName}</TableCell>
                            <TableCell className="text-right">{item.soldQuantity || 0}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.revenue || 0)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50 text-green-500" />
                    <p>No slow moving products detected</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Low Stock Alert
                <Badge variant="destructive" className="ml-2">{lowStockProducts.length}</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">Products that need restocking</p>
            </CardHeader>
            <CardContent>
              {inventoryLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : lowStockProducts.length > 0 ? (
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Current Stock</TableHead>
                        <TableHead className="text-right">Min Stock</TableHead>
                        <TableHead className="text-right">Reorder Qty</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lowStockProducts.map((item: any, index: number) => (
                        <TableRow key={item.productId || index}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell className="text-right text-red-600 font-semibold">{item.currentStock}</TableCell>
                          <TableCell className="text-right">{item.minStock}</TableCell>
                          <TableCell className="text-right">{item.reorderQuantity}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">Restock Needed</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50 text-green-500" />
                  <p>All products are well stocked!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
      />

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        customer={selectedCustomer}
        open={customerModalOpen}
        onOpenChange={setCustomerModalOpen}
      />
    </div>
  );
};

export default BusinessReports;
