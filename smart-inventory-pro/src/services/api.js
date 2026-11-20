// Centralized API Service with Automatic Fallback for Live & Demo Modes
// Seamlessly connects to Java Backend (http://localhost:8080/api)

const API_BASE_URL = 'http://localhost:8080/api';

// Rich fallback dataset matching MySQL seed_data.sql so the UI is NEVER empty
const FALLBACK_CATEGORIES = [
  { categoryId: 1, name: 'Electronics', description: 'Peripherals, gadgets and accessories' },
  { categoryId: 2, name: 'Stationery', description: 'Office supplies, notebooks and desk items' },
  { categoryId: 3, name: 'Groceries & Snacks', description: 'Packaged foods, tea and coffee' },
  { categoryId: 4, name: 'Personal Care', description: 'Daily hygiene and wellness products' }
];

const STORAGE_KEY_PRODUCTS = 'spc_products_catalog';
const STORAGE_KEY_MOVEMENTS = 'spc_stock_movements';
const STORAGE_KEY_SALES = 'spc_sales_records';

const INITIAL_PRODUCTS = [
  { productId: 1, sku: 'ELEC-LOGI-M170', name: 'Logitech Wireless Mouse M170', categoryId: 1, categoryName: 'Electronics', unitPrice: 650.0, costPrice: 480.0, currentStock: 8, leadTimeDays: 4, safetyStock: 6, targetStockDays: 30 },
  { productId: 2, sku: 'ELEC-SANS-USB32', name: 'SanDisk 32GB Ultra USB 3.0 Flash Drive', categoryId: 1, categoryName: 'Electronics', unitPrice: 420.0, costPrice: 310.0, currentStock: 12, leadTimeDays: 3, safetyStock: 5, targetStockDays: 25 },
  { productId: 3, sku: 'ELEC-BOAT-EP100', name: 'boAt Bassheads 100 Wired Earphones', categoryId: 1, categoryName: 'Electronics', unitPrice: 399.0, costPrice: 260.0, currentStock: 4, leadTimeDays: 5, safetyStock: 8, targetStockDays: 30 },
  { productId: 4, sku: 'ELEC-TYPEC-CBL', name: 'Braided Type-C Fast Charging Cable 1.5m', categoryId: 1, categoryName: 'Electronics', unitPrice: 199.0, costPrice: 110.0, currentStock: 25, leadTimeDays: 2, safetyStock: 6, targetStockDays: 20 },
  { productId: 5, sku: 'ELEC-LAP-STAND', name: 'Adjustable Aluminum Laptop Stand', categoryId: 1, categoryName: 'Electronics', unitPrice: 899.0, costPrice: 580.0, currentStock: 5, leadTimeDays: 6, safetyStock: 4, targetStockDays: 30 },
  { productId: 6, sku: 'STAT-CLASS-A4', name: 'Classmate Spiral Notebook A4 (300 Pages)', categoryId: 2, categoryName: 'Stationery', unitPrice: 140.0, costPrice: 95.0, currentStock: 10, leadTimeDays: 3, safetyStock: 10, targetStockDays: 30 },
  { productId: 7, sku: 'STAT-REYN-PEN', name: 'Reynolds 045 Ball Pen (Pack of 10)', categoryId: 2, categoryName: 'Stationery', unitPrice: 100.0, costPrice: 70.0, currentStock: 45, leadTimeDays: 2, safetyStock: 12, targetStockDays: 20 },
  { productId: 8, sku: 'STAT-FABER-HL', name: 'Faber-Castell Textliner Highlighters (Set of 5)', categoryId: 2, categoryName: 'Stationery', unitPrice: 125.0, costPrice: 85.0, currentStock: 6, leadTimeDays: 4, safetyStock: 5, targetStockDays: 30 },
  { productId: 9, sku: 'STAT-POSTIT-PD', name: '3M Post-it Sticky Notes (100 sheets)', categoryId: 2, categoryName: 'Stationery', unitPrice: 65.0, costPrice: 42.0, currentStock: 18, leadTimeDays: 3, safetyStock: 5, targetStockDays: 25 },
  { productId: 10, sku: 'STAT-KANG-STP', name: 'Kangaro No. 10 Stapler + 1000 Pins Box', categoryId: 2, categoryName: 'Stationery', unitPrice: 85.0, costPrice: 55.0, currentStock: 9, leadTimeDays: 3, safetyStock: 4, targetStockDays: 30 },
  { productId: 11, sku: 'GROC-NESC-CL50', name: 'Nescafe Classic Instant Coffee Jar 50g', categoryId: 3, categoryName: 'Groceries & Snacks', unitPrice: 185.0, costPrice: 145.0, currentStock: 7, leadTimeDays: 4, safetyStock: 6, targetStockDays: 30 },
  { productId: 12, sku: 'GROC-TATATEA-25', name: 'Tata Tea Gold Premium Blend 250g', categoryId: 3, categoryName: 'Groceries & Snacks', unitPrice: 160.0, costPrice: 125.0, currentStock: 22, leadTimeDays: 3, safetyStock: 8, targetStockDays: 25 },
  { productId: 13, sku: 'GROC-PARLE-G', name: 'Parle-G Gold Biscuits (1kg Family Pack)', categoryId: 3, categoryName: 'Groceries & Snacks', unitPrice: 120.0, costPrice: 96.0, currentStock: 14, leadTimeDays: 2, safetyStock: 10, targetStockDays: 20 },
  { productId: 14, sku: 'GROC-AMUL-DRK', name: 'Amul 55% Dark Chocolate Bar 150g', categoryId: 3, categoryName: 'Groceries & Snacks', unitPrice: 110.0, costPrice: 85.0, currentStock: 3, leadTimeDays: 5, safetyStock: 6, targetStockDays: 25 },
  { productId: 15, sku: 'CARE-DETT-LIQ', name: 'Dettol Liquid Handwash Refill 750ml', categoryId: 4, categoryName: 'Personal Care', unitPrice: 115.0, costPrice: 88.0, currentStock: 15, leadTimeDays: 3, safetyStock: 6, targetStockDays: 30 },
  { productId: 16, sku: 'CARE-HIM-FW100', name: 'Himalaya Purifying Neem Face Wash 100ml', categoryId: 4, categoryName: 'Personal Care', unitPrice: 145.0, costPrice: 108.0, currentStock: 5, leadTimeDays: 4, safetyStock: 5, targetStockDays: 30 },
  { productId: 17, sku: 'CARE-COLG-MAX', name: 'Colgate MaxFresh Spicy Fresh Toothpaste 150g', categoryId: 4, categoryName: 'Personal Care', unitPrice: 110.0, costPrice: 82.0, currentStock: 28, leadTimeDays: 2, safetyStock: 8, targetStockDays: 25 },
  { productId: 18, sku: 'CARE-NIV-CREAM', name: 'Nivea Soft Moisturizing Cream 100ml', categoryId: 4, categoryName: 'Personal Care', unitPrice: 195.0, costPrice: 148.0, currentStock: 6, leadTimeDays: 5, safetyStock: 5, targetStockDays: 30 }
];

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return fallback;
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (_) {}
}

let FALLBACK_PRODUCTS = loadFromStorage(STORAGE_KEY_PRODUCTS, [...INITIAL_PRODUCTS]);
// Ensure initial persistence so changes sync across tabs & refreshes
if (!localStorage.getItem(STORAGE_KEY_PRODUCTS)) {
  saveToStorage(STORAGE_KEY_PRODUCTS, FALLBACK_PRODUCTS);
}

const persistProducts = () => saveToStorage(STORAGE_KEY_PRODUCTS, FALLBACK_PRODUCTS);

let FALLBACK_MOVEMENTS = loadFromStorage(STORAGE_KEY_MOVEMENTS, [
  { movementId: 1, productId: 1, productName: 'Logitech Wireless Mouse M170', sku: 'ELEC-LOGI-M170', movementType: 'IN', quantity: 20, reason: 'Supplier Shipment #PO-401', movementDate: new Date(Date.now() - 3600000 * 5).toISOString() },
  { movementId: 2, productId: 3, productName: 'boAt Bassheads 100 Wired Earphones', sku: 'ELEC-BOAT-EP100', movementType: 'OUT', quantity: 2, reason: 'Counter Sale INV-9281', movementDate: new Date(Date.now() - 3600000 * 12).toISOString() },
  { movementId: 3, productId: 5, productName: 'Adjustable Aluminum Laptop Stand', sku: 'ELEC-LAP-STAND', movementType: 'OUT', quantity: 1, reason: 'Customer Purchase INV-9280', movementDate: new Date(Date.now() - 3600000 * 24).toISOString() },
  { movementId: 4, productId: 6, productName: 'Classmate Spiral Notebook A4', sku: 'STAT-CLASS-A4', movementType: 'IN', quantity: 50, reason: 'Bulk Stock Inward', movementDate: new Date(Date.now() - 3600000 * 48).toISOString() },
  { movementId: 5, productId: 14, productName: 'Amul 55% Dark Chocolate Bar', sku: 'GROC-AMUL-DRK', movementType: 'OUT', quantity: 5, reason: 'Store Counter Sale', movementDate: new Date(Date.now() - 3600000 * 60).toISOString() }
]);

const persistMovements = () => saveToStorage(STORAGE_KEY_MOVEMENTS, FALLBACK_MOVEMENTS);

let FALLBACK_SALES = loadFromStorage(STORAGE_KEY_SALES, [
  { saleId: 0, invoiceNo: 'INV-278166', saleDate: new Date().toISOString(), totalAmount: 650.0, customerName: 'Walk-in Customer', paymentMode: 'UPI', productName: 'Logitech Wireless Mouse M170', quantity: 1, unitPrice: 650.0, productId: 1, sku: 'ELEC-LOGI-M170', paymentStatus: 'PAID' },
  { saleId: 1, invoiceNo: 'INV-2026-801', saleDate: new Date(Date.now() - 3600000 * 2).toISOString(), totalAmount: 1300.0, customerName: 'Rahul Sharma (9876543210)', paymentMode: 'UPI', productName: 'Logitech Wireless Mouse M170', quantity: 2, unitPrice: 650.0, paymentStatus: 'PAID' },
  { saleId: 2, invoiceNo: 'INV-2026-802', saleDate: new Date(Date.now() - 3600000 * 8).toISOString(), totalAmount: 899.0, customerName: 'Priya Patel (9811223344)', paymentMode: 'Credit Card', productName: 'boAt Bassheads 100 Wired Earphones', quantity: 1, unitPrice: 899.0, paymentStatus: 'PAID' },
  { saleId: 3, invoiceNo: 'INV-2026-803', saleDate: new Date(Date.now() - 3600000 * 20).toISOString(), totalAmount: 420.0, customerName: 'Amit Verma', paymentMode: 'Cash', productName: 'Classmate Spiral Notebook A4', quantity: 3, unitPrice: 140.0, paymentStatus: 'PENDING_CASH' },
  { saleId: 4, invoiceNo: 'INV-2026-804', saleDate: new Date(Date.now() - 3600000 * 36).toISOString(), totalAmount: 1197.0, customerName: 'Sneha Joshi', paymentMode: 'UPI', productName: 'Braided Type-C Fast Charging Cable', quantity: 3, unitPrice: 399.0, paymentStatus: 'PAID' },
  { saleId: 5, invoiceNo: 'INV-2026-805', saleDate: new Date(Date.now() - 3600000 * 48).toISOString(), totalAmount: 740.0, customerName: 'Vikas Singh', paymentMode: 'Cash', productName: 'Tata Tea Gold Premium Blend 250g', quantity: 2, unitPrice: 370.0, paymentStatus: 'PAID' },
  { saleId: 6, invoiceNo: 'INV-2026-806', saleDate: new Date(Date.now() - 3600000 * 72).toISOString(), totalAmount: 2450.0, customerName: 'Karan Malhotra', paymentMode: 'UPI', productName: 'Adjustable Aluminum Laptop Stand', quantity: 1, unitPrice: 2450.0, paymentStatus: 'PAID' }
]);

const persistSales = () => saveToStorage(STORAGE_KEY_SALES, FALLBACK_SALES);

function calculateFallbackPredictions() {
  return FALLBACK_PRODUCTS.map((p) => {
    // Generate realistic historical daily sales velocity based on category and stock
    const ads = p.productId % 3 === 0 ? 3.2 : p.productId % 2 === 0 ? 2.5 : 1.8;
    const rop = Math.ceil((ads * p.leadTimeDays) + p.safetyStock);
    const targetInventory = Math.ceil(p.targetStockDays * ads);
    const suggestedRestock = Math.max(0, targetInventory - p.currentStock);
    const daysRemaining = Math.round((p.currentStock / ads) * 10) / 10;

    let urgency = 'OPTIMAL';
    let explanation = `Stock level (${p.currentStock}) is healthy. Exceeds ROP of ${rop}.`;

    if (p.currentStock <= p.safetyStock || daysRemaining <= 2.5) {
      urgency = 'CRITICAL';
      explanation = `CRITICAL ALERT! Current stock (${p.currentStock}) is at or below safety buffer (${p.safetyStock}). Stockout in ${daysRemaining} days! Reorder ${suggestedRestock} units immediately.`;
    } else if (p.currentStock <= rop) {
      urgency = 'WARNING';
      explanation = `Reorder point reached! Current stock (${p.currentStock}) <= ROP (${rop}). Supplier lead time is ${p.leadTimeDays} days. Recommended restock: ${suggestedRestock} units.`;
    }

    return {
      productId: p.productId,
      sku: p.sku,
      productName: p.name,
      categoryName: p.categoryName,
      currentStock: p.currentStock,
      averageDailySales: ads,
      leadTimeDays: p.leadTimeDays,
      safetyStock: p.safetyStock,
      reorderPoint: rop,
      targetStockDays: p.targetStockDays,
      suggestedRestockQuantity: suggestedRestock,
      daysOfSupplyRemaining: daysRemaining,
      urgencyStatus: urgency,
      explanation: explanation
    };
  }).sort((a, b) => {
    const rank = { CRITICAL: 1, WARNING: 2, OPTIMAL: 3 };
    return rank[a.urgencyStatus] - rank[b.urgencyStatus];
  });
}

/**
 * Helper to fetch with timeout and standard JSON parsing
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    signal: controller.signal,
    ...options,
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    if (!response.ok) {
      let errorMsg = `Server error: ${response.status} ${response.statusText}`;
      try {
        const errJson = await response.json();
        if (errJson && errJson.error) errorMsg = errJson.error;
      } catch (_) {}
      throw new Error(errorMsg);
    }
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export const api = {
  // System Health
  checkHealth: async () => {
    try {
      return await request('/health');
    } catch {
      return { status: 'OFFLINE', databaseConnected: false };
    }
  },

  // Dashboard Metrics
  getDashboardMetrics: async () => {
    try {
      return await request('/dashboard/metrics');
    } catch {
      const preds = calculateFallbackPredictions();
      const crit = preds.filter(p => p.urgencyStatus === 'CRITICAL').length;
      const warn = preds.filter(p => p.urgencyStatus === 'WARNING').length;
      const totalVal = FALLBACK_PRODUCTS.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0);
      const totalUnits = FALLBACK_PRODUCTS.reduce((sum, p) => sum + p.currentStock, 0);

      return {
        totalProducts: FALLBACK_PRODUCTS.length,
        totalUnitsInStock: totalUnits,
        totalInventoryValue: Math.round(totalVal),
        criticalAlerts: crit,
        warningAlerts: warn,
        optimalCount: FALLBACK_PRODUCTS.length - crit - warn
      };
    }
  },

  // Categories
  getCategories: async () => {
    try {
      return await request('/categories');
    } catch {
      return FALLBACK_CATEGORIES;
    }
  },

  addCategory: async (categoryData) => {
    try {
      return await request('/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
      });
    } catch {
      const newCat = { categoryId: Date.now(), ...categoryData };
      FALLBACK_CATEGORIES.push(newCat);
      return newCat;
    }
  },

  // Products
  getProducts: async () => {
    try {
      return await request('/products');
    } catch {
      return [...FALLBACK_PRODUCTS];
    }
  },

  addProduct: async (productData) => {
    try {
      return await request('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
    } catch {
      const newP = {
        productId: Date.now(),
        sku: productData.sku,
        name: productData.name,
        categoryId: parseInt(productData.categoryId) || 1,
        categoryName: FALLBACK_CATEGORIES.find(c => c.categoryId == productData.categoryId)?.name || 'General',
        unitPrice: parseFloat(productData.unitPrice),
        costPrice: parseFloat(productData.costPrice || 0),
        currentStock: parseInt(productData.currentStock || 0),
        leadTimeDays: parseInt(productData.leadTimeDays || 3),
        safetyStock: parseInt(productData.safetyStock || 5),
        targetStockDays: parseInt(productData.targetStockDays || 30)
      };
      FALLBACK_PRODUCTS.unshift(newP);
      persistProducts();
      return newP;
    }
  },

  updateProduct: async (productData) => {
    try {
      return await request('/products', {
        method: 'PUT',
        body: JSON.stringify(productData),
      });
    } catch {
      const idx = FALLBACK_PRODUCTS.findIndex(p => p.productId == productData.productId);
      if (idx !== -1) {
        FALLBACK_PRODUCTS[idx] = { ...FALLBACK_PRODUCTS[idx], ...productData };
        persistProducts();
      }
      return productData;
    }
  },

  deleteProduct: async (productId) => {
    try {
      return await request(`/products?id=${productId}`, {
        method: 'DELETE',
      });
    } catch {
      FALLBACK_PRODUCTS = FALLBACK_PRODUCTS.filter(p => p.productId != productId);
      persistProducts();
      return { success: true };
    }
  },

  resetCatalogToDefaults: () => {
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    FALLBACK_PRODUCTS = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    persistProducts();
    return [...FALLBACK_PRODUCTS];
  },

  // Stock In / Out / Movements
  getStockMovements: async () => {
    try {
      return await request('/stock/movements');
    } catch {
      return [...FALLBACK_MOVEMENTS];
    }
  },

  recordStockIn: async (data) => {
    try {
      return await request('/stock/in', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const p = FALLBACK_PRODUCTS.find(x => x.productId == data.productId);
      if (p) {
        p.currentStock += parseInt(data.quantity);
        persistProducts();
      }
      FALLBACK_MOVEMENTS.unshift({
        movementId: Date.now(),
        productId: data.productId,
        productName: p ? p.name : 'Product',
        sku: p ? p.sku : 'SKU',
        movementType: 'IN',
        quantity: parseInt(data.quantity),
        reason: data.reason || 'Restock Shipment Received',
        movementDate: new Date().toISOString()
      });
      persistMovements();
      return { success: true };
    }
  },

  recordStockOut: async (data) => {
    try {
      return await request('/stock/out', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const p = FALLBACK_PRODUCTS.find(x => x.productId == data.productId);
      if (p) {
        if (p.currentStock < parseInt(data.quantity)) {
          throw new Error(`Insufficient stock! Current stock is ${p.currentStock}.`);
        }
        p.currentStock -= parseInt(data.quantity);
        persistProducts();
      }
      FALLBACK_MOVEMENTS.unshift({
        movementId: Date.now(),
        productId: data.productId,
        productName: p ? p.name : 'Product',
        sku: p ? p.sku : 'SKU',
        movementType: 'OUT',
        quantity: parseInt(data.quantity),
        reason: data.reason || 'Damaged / Write-off',
        movementDate: new Date().toISOString()
      });
      persistMovements();
      return { success: true };
    }
  },

  // Sales (POS)
  getSales: async () => {
    try {
      return await request('/sales');
    } catch {
      return [...FALLBACK_SALES];
    }
  },

  recordSale: async (saleData) => {
    try {
      return await request('/sales', {
        method: 'POST',
        body: JSON.stringify(saleData),
      });
    } catch {
      const p = FALLBACK_PRODUCTS.find(x => x.productId == saleData.productId);
      if (p) {
        if (p.currentStock < parseInt(saleData.quantity)) {
          throw new Error(`Insufficient stock for sale! Only ${p.currentStock} units in stock.`);
        }
        p.currentStock -= parseInt(saleData.quantity);
        persistProducts();
      }
      const invNo = 'INV-' + Math.floor(100000 + Math.random() * 900000);
      const qty = parseInt(saleData.quantity || 1);
      const rate = parseFloat(saleData.unitPrice || (p ? p.unitPrice : 0));
      const newSale = {
        saleId: Date.now(),
        invoiceNo: invNo,
        productId: p ? p.productId : saleData.productId,
        productName: p ? p.name : (saleData.productName || 'Counter Item'),
        sku: p ? p.sku : (saleData.sku || 'SKU'),
        quantity: qty,
        unitPrice: rate,
        saleDate: new Date().toISOString(),
        totalAmount: rate * qty,
        customerName: saleData.customerName || 'Walk-in Customer',
        paymentMode: saleData.paymentMode || 'Cash',
        paymentStatus: saleData.paymentMode === 'Cash' ? 'PENDING_CASH' : 'PAID'
      };
      FALLBACK_SALES.unshift(newSale);
      persistSales();
      return { success: true, invoiceNo: invNo };
    }
  },

  voidSale: async (invoiceNo) => {
    try {
      return await request(`/sales/void?invoiceNo=${invoiceNo}`, { method: 'POST' });
    } catch {
      const idx = FALLBACK_SALES.findIndex(s => s.invoiceNo === invoiceNo);
      if (idx !== -1) {
        const sale = FALLBACK_SALES[idx];
        const qtyToRestore = sale.quantity || 1;
        const p = FALLBACK_PRODUCTS.find(x => 
          x.productId == sale.productId || 
          (sale.sku && x.sku === sale.sku) || 
          (sale.productName && x.name === sale.productName)
        );
        if (p) {
          p.currentStock += qtyToRestore;
          persistProducts();
        }
        FALLBACK_SALES.splice(idx, 1);
        persistSales();

        FALLBACK_MOVEMENTS.unshift({
          movementId: Date.now(),
          productId: p ? p.productId : (sale.productId || 0),
          productName: p ? p.name : (sale.productName || 'Item'),
          sku: p ? p.sku : (sale.sku || 'SKU'),
          movementType: 'IN',
          quantity: qtyToRestore,
          reason: `Voided Invoice #${invoiceNo} (Accidental Sale Cancelled)`,
          movementDate: new Date().toISOString()
        });
        persistMovements();

        return { 
          success: true, 
          restoredQuantity: qtyToRestore, 
          productName: p ? p.name : (sale.productName || 'Item') 
        };
      }
      throw new Error(`Invoice ${invoiceNo} not found.`);
    }
  },

  markCashCollected: async (invoiceNo) => {
    const sale = FALLBACK_SALES.find(s => s.invoiceNo === invoiceNo);
    if (sale) {
      sale.paymentStatus = 'PAID';
      persistSales();
      return { success: true };
    }
    throw new Error(`Invoice ${invoiceNo} not found.`);
  },

  // Demand Prediction & Reorder Engine
  getPredictions: async () => {
    try {
      return await request('/predictions');
    } catch {
      return calculateFallbackPredictions();
    }
  },
};
