import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Package, Search, RefreshCw, Calendar, FileText, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, RotateCcw, ShoppingCart, Truck, Check, ChevronsUpDown, X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { productsApi } from "@/services/api";
import { apiConfig } from "@/utils/apiConfig";
import { useNavigate } from "react-router-dom";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface InventoryLog {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  type: string;
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
  reason: string;
  condition: string;
  createdAt: string;
  sale: any;
  purchase: any;
}

const InventoryLogs = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Fetch all products for dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const response = await productsApi.getAll({ limit: 10000 });
        if (response.data?.products) {
          setProducts(response.data.products);
        } else if (Array.isArray(response.data)) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive"
        });
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch inventory logs when product is selected
  const fetchLogs = async (productId: string, page: number = 1) => {
    if (!productId) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${apiConfig.getBaseUrl()}/inventory-logs?product_id=${productId}&page=${page}&per_page=20`
      );
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.data.logs || []);
        setPagination(data.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 20
        });
      }
    } catch (error) {
      console.error("Error fetching inventory logs:", error);
      toast({
        title: "Error",
        description: "Failed to load inventory logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProductId) {
      fetchLogs(selectedProductId, 1);
    }
  }, [selectedProductId]);

  // Get log type styling
  const getLogTypeStyles = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sale':
        return {
          icon: ShoppingCart,
          color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
          bgColor: 'border-l-red-500'
        };
      case 'purchase':
        return {
          icon: Truck,
          color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
          bgColor: 'border-l-green-500'
        };
      case 'adjustment':
        return {
          icon: RefreshCw,
          color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
          bgColor: 'border-l-blue-500'
        };
      case 'return':
        return {
          icon: RotateCcw,
          color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
          bgColor: 'border-l-purple-500'
        };
      default:
        return {
          icon: Package,
          color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
          bgColor: 'border-l-gray-500'
        };
    }
  };

  const selectedProduct = products.find(p => p.id?.toString() === selectedProductId);

  const clearSelection = () => {
    setSelectedProductId("");
    setLogs([]);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Inventory Logs</h1>
            <p className="text-xs text-muted-foreground">Track stock movements</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/sales')}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      {/* Product Selector - Clean Professional Design */}
      <div className="bg-card border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground min-w-fit">
            <Package className="h-4 w-4" />
            Product:
          </div>
          
          <div className="flex-1 w-full">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between h-10 font-normal"
                  disabled={productsLoading}
                >
                  {productsLoading ? (
                    <span className="text-muted-foreground">Loading products...</span>
                  ) : selectedProduct ? (
                    <span className="flex items-center gap-2 truncate">
                      <span className="font-medium">{selectedProduct.name}</span>
                      <span className="text-xs text-muted-foreground">({selectedProduct.sku})</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Search and select a product...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover" align="start">
                <Command>
                  <CommandInput placeholder="Search by name or SKU..." className="h-10" />
                  <CommandList className="max-h-[300px]">
                    <CommandEmpty>No product found.</CommandEmpty>
                    <CommandGroup>
                      {products.map((product) => (
                        <CommandItem
                          key={product.id}
                          value={`${product.name} ${product.sku}`}
                          onSelect={() => {
                            setSelectedProductId(product.id?.toString() || "");
                            setOpen(false);
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedProductId === product.id?.toString() ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-medium truncate">{product.name}</span>
                            <span className="text-xs text-muted-foreground">
                              SKU: {product.sku} | Stock: {product.stock || 0}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedProduct && (
            <Button variant="ghost" size="sm" onClick={clearSelection} className="shrink-0">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Selected Product Quick Stats */}
        {selectedProduct && (
          <div className="mt-3 pt-3 border-t flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Category: <span className="text-foreground font-medium">{selectedProduct.category || 'N/A'}</span></span>
              <span className="text-muted-foreground">Current Stock: <span className="text-primary font-bold">{selectedProduct.stock || 0}</span></span>
              <span className="text-muted-foreground">Min: <span className="text-foreground">{selectedProduct.minStock || 0}</span></span>
            </div>
            <Badge variant="outline" className="text-xs">
              {products.length} products loaded
            </Badge>
          </div>
        )}
      </div>

      {/* Logs Section */}
      {selectedProductId ? (
        <Card>
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-medium">Activity History</span>
              {!loading && (
                <Badge variant="secondary" className="text-xs">
                  {pagination.totalItems} entries
                </Badge>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => fetchLogs(selectedProductId, pagination.currentPage)}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <CardContent className="p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-muted animate-pulse"></div>
                  <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">Loading logs...</div>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">No Activity</p>
                <p className="text-sm text-muted-foreground">No inventory logs for this product</p>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => {
                  const typeStyles = getLogTypeStyles(log.type);
                  const TypeIcon = typeStyles.icon;
                  const quantityChange = log.balanceAfter - log.balanceBefore;
                  const isPositive = quantityChange >= 0;

                  return (
                    <div
                      key={log.id}
                      className={`p-3 rounded-lg border border-l-4 ${typeStyles.bgColor} bg-card hover:bg-muted/50 transition-colors`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`p-1.5 rounded ${typeStyles.color}`}>
                            <TypeIcon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className={`text-xs ${typeStyles.color} border-0`}>
                                {log.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <p className="text-sm font-medium mt-0.5 truncate">{log.reason || log.reference}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className={`flex items-center gap-1 justify-end font-bold ${
                            isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            {isPositive ? '+' : ''}{quantityChange}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {log.balanceBefore} → {log.balanceAfter}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-3 border-t mt-3">
                    <span className="text-xs text-muted-foreground">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.currentPage <= 1}
                        onClick={() => fetchLogs(selectedProductId, pagination.currentPage - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.currentPage >= pagination.totalPages}
                        onClick={() => fetchLogs(selectedProductId, pagination.currentPage + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="border border-dashed rounded-lg p-8 text-center">
          <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">Select a Product</p>
          <p className="text-sm text-muted-foreground mt-1">
            Search and select a product above to view its inventory history
          </p>
        </div>
      )}
    </div>
  );
};

export default InventoryLogs;
