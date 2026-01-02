import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";

interface FilteredProductsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  filterType: 'lowStock' | 'outOfStock' | 'inStock' | 'all';
  onFetchAllProducts?: () => Promise<any[]>;
  products?: any[];
}

export const FilteredProductsModal: React.FC<FilteredProductsModalProps> = ({
  open,
  onOpenChange,
  title,
  filterType,
  onFetchAllProducts,
  products = []
}) => {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (open && onFetchAllProducts && !hasFetched.current) {
      hasFetched.current = true;
      fetchAllProducts();
    } else if (open && products.length > 0 && !onFetchAllProducts) {
      setAllProducts(products);
    }
    
    // Reset when modal closes
    if (!open) {
      hasFetched.current = false;
    }
  }, [open]);

  const fetchAllProducts = async () => {
    if (!onFetchAllProducts) return;
    
    try {
      setLoading(true);
      const fetchedProducts = await onFetchAllProducts();
      setAllProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
    } catch (error) {
      console.error('Failed to fetch all products:', error);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProducts = () => {
    switch (filterType) {
      case 'lowStock':
        return allProducts.filter(product => {
          const stock = product.stock || product.currentStock || 0;
          const minStock = product.minStock || 0;
          return stock <= minStock;
        });
      case 'outOfStock':
        return allProducts.filter(product => (product.stock || product.currentStock || 0) === 0);
      case 'inStock':
        return allProducts.filter(product => (product.stock || product.currentStock || 0) > (product.minStock || 0));
      default:
        return allProducts;
    }
  };

  const filteredProducts = getFilteredProducts();

  const getStockStatus = (currentStock: number, minStock: number) => {
    if (currentStock === 0) return { status: 'Out of Stock', color: 'bg-red-500 text-white', icon: AlertTriangle };
    if (currentStock <= minStock) return { status: 'Low Stock', color: 'bg-orange-500 text-white', icon: AlertTriangle };
    return { status: 'In Stock', color: 'bg-green-500 text-white', icon: TrendingUp };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            {title} {!loading && `(${filteredProducts.length} products)`}
          </DialogTitle>
          <DialogDescription>
            {loading ? 'Fetching all products...' : `Showing ${filterType === 'lowStock' ? 'low stock and out of stock' : filterType} products`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              {/* Beautiful animated loader */}
              <div className="relative">
                {/* Outer ring */}
                <div className="w-16 h-16 rounded-full border-4 border-muted animate-pulse"></div>
                {/* Spinning ring */}
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600 animate-pulse" />
                </div>
              </div>
              <div className="mt-4 text-sm font-medium text-muted-foreground">Loading products...</div>
              <div className="mt-1 text-xs text-muted-foreground/60">Please wait</div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <div className="font-medium text-foreground">All stocked up!</div>
              <div className="text-sm text-muted-foreground mt-1">No products found for this filter</div>
            </div>
          ) : (
            <div className="grid gap-2">
              {filteredProducts.map((product, index) => {
                const currentStock = product.stock || product.currentStock || 0;
                const minStock = product.minStock || 0;
                const stockStatus = getStockStatus(currentStock, minStock);
                const StatusIcon = stockStatus.icon;

                return (
                  <Card key={product.id || index} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground text-sm truncate">{product.name || product.productName}</h4>
                          <p className="text-xs text-muted-foreground">SKU: {product.sku} | {product.category}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <div className="font-medium text-blue-600 text-sm">{currentStock} {product.unit || 'units'}</div>
                            <div className="text-xs text-muted-foreground">Min: {minStock}</div>
                          </div>
                          <Badge className={`text-xs ${stockStatus.color} flex items-center gap-1 whitespace-nowrap`}>
                            <StatusIcon className="h-3 w-3" />
                            {stockStatus.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
