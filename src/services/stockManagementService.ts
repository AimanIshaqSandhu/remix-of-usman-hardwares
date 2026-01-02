// Stock Management Service - DISABLED
// All stock operations are handled by the backend API
// This service is now a no-op to prevent frontend stock interference

export interface StockMovement {
  id?: number;
  productId: number;
  productName: string;
  type: 'sale' | 'purchase' | 'adjustment' | 'return' | 'damage';
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  reference?: string;
  orderId?: number;
  orderNumber?: string;
  createdAt: string;
  createdBy?: string;
}

export interface StockAlert {
  productId: number;
  productName: string;
  currentStock: number;
  minStock: number;
  type: 'low_stock' | 'out_of_stock';
  severity: 'warning' | 'critical';
}

export interface StockValidationResult {
  isValid: boolean;
  availableStock: number;
  requestedQuantity: number;
  shortfall?: number;
  message: string;
}

export interface OrderStockAdjustment {
  orderId: number;
  orderNumber: string;
  currentStatus: string;
  lastAdjustedStatus: string;
  stockAdjusted: boolean;
  adjustmentTimestamp: string;
}

class StockManagementService {
  // DISABLED: All stock operations are handled by the backend API
  // These methods are no-ops to prevent any frontend stock interference

  // Handle order status change - NO-OP, backend handles this
  async handleOrderStatusChange(
    orderId: number,
    orderNumber: string,
    orderItems: any[],
    newStatus: string,
    oldStatus: string
  ): Promise<{ success: boolean; message: string }> {
    console.log(`[STOCK-SERVICE-DISABLED] Order status change: ${oldStatus} -> ${newStatus} for order ${orderNumber}`);
    console.log('[STOCK-SERVICE-DISABLED] Stock operations are handled by the backend API');
    
    // Always return success - let the backend handle stock
    return {
      success: true,
      message: 'Stock handled by backend API'
    };
  }

  // Validate stock availability - NO-OP, always returns valid
  async validateStockAvailability(productId: number, requestedQuantity: number): Promise<StockValidationResult> {
    console.log(`[STOCK-SERVICE-DISABLED] Stock validation bypassed for product ${productId}`);
    return {
      isValid: true,
      availableStock: requestedQuantity,
      requestedQuantity,
      message: 'Stock validation handled by backend'
    };
  }

  // Deduct stock - NO-OP, backend handles this
  async deductStock(
    productId: number, 
    quantity: number, 
    orderId?: number, 
    orderNumber?: string
  ): Promise<{ success: boolean; message: string; newStock?: number }> {
    console.log(`[STOCK-SERVICE-DISABLED] Stock deduction bypassed for product ${productId}, quantity: ${quantity}`);
    console.log('[STOCK-SERVICE-DISABLED] Stock deduction is handled by the backend API');
    return {
      success: true,
      message: 'Stock deduction handled by backend API'
    };
  }

  // Add stock - NO-OP, backend handles this
  async addStock(
    productId: number, 
    quantity: number, 
    reason: string = 'Stock addition',
    reference?: string
  ): Promise<{ success: boolean; message: string; newStock?: number }> {
    console.log(`[STOCK-SERVICE-DISABLED] Stock addition bypassed for product ${productId}, quantity: ${quantity}`);
    console.log('[STOCK-SERVICE-DISABLED] Stock addition is handled by the backend API');
    return {
      success: true,
      message: 'Stock addition handled by backend API'
    };
  }

  // Check stock alerts - returns empty array
  async checkStockAlerts(productId?: number): Promise<StockAlert[]> {
    console.log('[STOCK-SERVICE-DISABLED] Stock alerts check bypassed');
    return [];
  }

  // Get current stock - returns 0, actual stock is from API
  async getCurrentStock(productId: number): Promise<number> {
    console.log(`[STOCK-SERVICE-DISABLED] getCurrentStock bypassed for product ${productId}`);
    return 0;
  }

  // Calculate inventory value - returns zeros
  async calculateInventoryValue(): Promise<{ totalValue: number; totalProducts: number }> {
    console.log('[STOCK-SERVICE-DISABLED] calculateInventoryValue bypassed');
    return { totalValue: 0, totalProducts: 0 };
  }

  // Bulk stock operations - NO-OP
  async bulkStockOperation(
    operations: Array<{
      productId: number;
      quantity: number;
      type: 'add' | 'deduct';
      reason?: string;
      reference?: string;
    }>
  ): Promise<{ success: boolean; results: Array<{ productId: number; success: boolean; message: string }> }> {
    console.log(`[STOCK-SERVICE-DISABLED] Bulk stock operation bypassed for ${operations.length} operations`);
    return {
      success: true,
      results: operations.map(op => ({
        productId: op.productId,
        success: true,
        message: 'Handled by backend API'
      }))
    };
  }

  // Get stock movements - returns empty array
  getMovements(): StockMovement[] {
    return [];
  }

  // Get current alerts - returns empty array
  getAlerts(): StockAlert[] {
    return [];
  }
}

export const stockManagementService = new StockManagementService();
