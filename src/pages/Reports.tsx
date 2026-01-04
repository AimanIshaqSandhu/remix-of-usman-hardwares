import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Package, 
  Users, 
  FolderOpen, 
  ShoppingCart, 
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportsApi } from "@/services/reportsApi";
import { SalesOverviewTab } from "@/components/reports/SalesOverviewTab";
import { TopProductsTab } from "@/components/reports/TopProductsTab";
import { TopCustomersTab } from "@/components/reports/TopCustomersTab";
import { CategoryPerformanceTab } from "@/components/reports/CategoryPerformanceTab";
import { ProductSalesTab } from "@/components/reports/ProductSalesTab";
import { CustomerPurchasesTab } from "@/components/reports/CustomerPurchasesTab";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: salesOverview = [], isLoading: loadingOverview, refetch: refetchOverview } = useQuery({
    queryKey: ['monthly-sales-overview'],
    queryFn: reportsApi.getMonthlySalesOverview,
  });

  const { data: topProducts = [], isLoading: loadingTopProducts, refetch: refetchTopProducts } = useQuery({
    queryKey: ['monthly-top-products'],
    queryFn: reportsApi.getMonthlyTopProducts,
  });

  const { data: topCustomers = [], isLoading: loadingTopCustomers, refetch: refetchTopCustomers } = useQuery({
    queryKey: ['monthly-top-customers'],
    queryFn: reportsApi.getMonthlyTopCustomers,
  });

  const { data: categoryPerformance = [], isLoading: loadingCategories, refetch: refetchCategories } = useQuery({
    queryKey: ['monthly-category-performance'],
    queryFn: reportsApi.getMonthlyCategoryPerformance,
  });

  const { data: productSales = [], isLoading: loadingProductSales, refetch: refetchProductSales } = useQuery({
    queryKey: ['monthly-product-sales'],
    queryFn: reportsApi.getMonthlyProductSales,
  });

  const { data: customerPurchases = [], isLoading: loadingCustomerPurchases, refetch: refetchCustomerPurchases } = useQuery({
    queryKey: ['monthly-customer-purchases'],
    queryFn: reportsApi.getMonthlyCustomerPurchases,
  });

  const handleRefreshAll = () => {
    refetchOverview();
    refetchTopProducts();
    refetchTopCustomers();
    refetchCategories();
    refetchProductSales();
    refetchCustomerPurchases();
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Monthly Reports</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive monthly business analytics and insights
          </p>
        </div>
        <Button onClick={handleRefreshAll} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh All
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto gap-1 bg-muted p-1">
          <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-background">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="top-products" className="gap-2 data-[state=active]:bg-background">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Top Products</span>
          </TabsTrigger>
          <TabsTrigger value="top-customers" className="gap-2 data-[state=active]:bg-background">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Top Customers</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2 data-[state=active]:bg-background">
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Categories</span>
          </TabsTrigger>
          <TabsTrigger value="product-sales" className="gap-2 data-[state=active]:bg-background">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Product Sales</span>
          </TabsTrigger>
          <TabsTrigger value="customer-purchases" className="gap-2 data-[state=active]:bg-background">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Customer Purchases</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <SalesOverviewTab data={salesOverview} isLoading={loadingOverview} />
        </TabsContent>

        <TabsContent value="top-products" className="mt-6">
          <TopProductsTab data={topProducts} isLoading={loadingTopProducts} />
        </TabsContent>

        <TabsContent value="top-customers" className="mt-6">
          <TopCustomersTab data={topCustomers} isLoading={loadingTopCustomers} />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoryPerformanceTab data={categoryPerformance} isLoading={loadingCategories} />
        </TabsContent>

        <TabsContent value="product-sales" className="mt-6">
          <ProductSalesTab data={productSales} isLoading={loadingProductSales} />
        </TabsContent>

        <TabsContent value="customer-purchases" className="mt-6">
          <CustomerPurchasesTab data={customerPurchases} isLoading={loadingCustomerPurchases} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
