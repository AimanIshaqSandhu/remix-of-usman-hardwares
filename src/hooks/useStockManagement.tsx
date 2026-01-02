import { useState } from 'react';
import { StockAlert, StockMovement, StockValidationResult } from '@/services/stockManagementService';

// DISABLED: All stock operations are handled by the backend API
// This hook is now a no-op to prevent frontend stock interference

export const useStockManagement = () => {
  const [alerts] = useState<StockAlert[]>([]);
  const [movements] = useState<StockMovement[]>([]);
  const [loading] = useState(false);

  // Handle order status changes - NO-OP, let backend handle stock
  const handleOrderStatusChange = async (
    orderId: number,
    orderNumber: string,
    orderItems: any[],
    newStatus: string,
    oldStatus: string
  ) => {
    console.log(`[STOCK-HOOK-DISABLED] Order status change: ${oldStatus} -> ${newStatus} for order ${orderNumber}`);
    console.log('[STOCK-HOOK-DISABLED] Stock operations are handled by the backend API');
    
    return { success: true, message: 'Stock handled by backend API' };
  };

  // Validate stock - always returns valid, backend handles validation
  const validateStock = async (productId: number, quantity: number): Promise<StockValidationResult> => {
    console.log(`[STOCK-HOOK-DISABLED] Stock validation bypassed for product ${productId}`);
    return {
      isValid: true,
      availableStock: quantity,
      requestedQuantity: quantity,
      message: 'Stock validation handled by backend'
    };
  };

  // Deduct stock - NO-OP, backend handles this
  const deductStock = async (
    productId: number,
    quantity: number,
    orderId?: number,
    orderNumber?: string
  ) => {
    console.log(`[STOCK-HOOK-DISABLED] Stock deduction bypassed for product ${productId}`);
    return { success: true, message: 'Stock handled by backend API' };
  };

  // Add stock - NO-OP, backend handles this
  const addStock = async (
    productId: number,
    quantity: number,
    reason: string = 'Stock addition',
    reference?: string
  ) => {
    console.log(`[STOCK-HOOK-DISABLED] Stock addition bypassed for product ${productId}`);
    return { success: true, message: 'Stock handled by backend API' };
  };

  // Refresh alerts - NO-OP
  const refreshAlerts = async () => {
    console.log('[STOCK-HOOK-DISABLED] Alerts refresh bypassed');
    return [];
  };

  // Get current stock - returns 0
  const getCurrentStock = async (productId: number): Promise<number> => {
    console.log(`[STOCK-HOOK-DISABLED] getCurrentStock bypassed for product ${productId}`);
    return 0;
  };

  // Calculate inventory value - returns zeros
  const calculateInventoryValue = async () => {
    console.log('[STOCK-HOOK-DISABLED] calculateInventoryValue bypassed');
    return { totalValue: 0, totalProducts: 0 };
  };

  // Bulk operations - NO-OP
  const bulkStockOperation = async (operations: Array<{
    productId: number;
    quantity: number;
    type: 'add' | 'deduct';
    reason?: string;
    reference?: string;
  }>) => {
    console.log(`[STOCK-HOOK-DISABLED] Bulk operation bypassed for ${operations.length} operations`);
    return {
      success: true,
      results: operations.map(op => ({
        productId: op.productId,
        success: true,
        message: 'Handled by backend API'
      }))
    };
  };

  return {
    // State
    alerts,
    movements,
    loading,
    
    // Actions - all are no-ops, backend handles stock
    handleOrderStatusChange,
    validateStock,
    deductStock,
    addStock,
    refreshAlerts,
    getCurrentStock,
    calculateInventoryValue,
    bulkStockOperation
  };
};
