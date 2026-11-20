package com.inventory.service;

import com.inventory.dao.DBConnection;
import com.inventory.dao.ProductDAO;
import com.inventory.dao.SalesDAO;
import com.inventory.dao.StockMovementDAO;
import com.inventory.exception.InsufficientStockException;
import com.inventory.model.Product;
import com.inventory.model.RestockRecommendation;
import com.inventory.model.StockMovement;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * InventoryService
 * Handles high-level stock operations, validation, and dashboard aggregations.
 */
public class InventoryService {
    private final ProductDAO productDAO = new ProductDAO();
    private final StockMovementDAO movementDAO = new StockMovementDAO();
    private final SalesDAO salesDAO = new SalesDAO();
    private final DemandPredictorService predictorService = new DemandPredictorService();
    private final DBConnection db = DBConnection.getInstance();

    public boolean recordStockIn(int productId, int quantity, String reason) throws SQLException {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Stock-in quantity must be greater than zero.");
        }

        try (Connection conn = db.getConnection()) {
            try {
                conn.setAutoCommit(false);

                // Update product stock
                boolean updated = productDAO.updateStockDelta(productId, quantity, conn);
                if (!updated) {
                    throw new SQLException("Failed to update product stock for ID: " + productId);
                }

                // Log movement
                StockMovement sm = new StockMovement(productId, "IN", quantity, reason != null ? reason : "Shipment Received");
                movementDAO.recordMovement(sm, conn);

                conn.commit();
                return true;
            } catch (Exception e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        }
    }

    public boolean recordStockOut(int productId, int quantity, String reason) throws SQLException, InsufficientStockException {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Stock-out quantity must be greater than zero.");
        }

        Product p = productDAO.getProductById(productId);
        if (p == null) {
            throw new SQLException("Product not found with ID: " + productId);
        }
        if (p.getCurrentStock() < quantity) {
            throw new InsufficientStockException(productId, quantity, p.getCurrentStock());
        }

        try (Connection conn = db.getConnection()) {
            try {
                conn.setAutoCommit(false);

                // Update product stock
                boolean updated = productDAO.updateStockDelta(productId, -quantity, conn);
                if (!updated) {
                    throw new SQLException("Failed to reduce product stock for ID: " + productId);
                }

                // Log movement
                StockMovement sm = new StockMovement(productId, "OUT", quantity, reason != null ? reason : "Manual Stock Adjustment / Waste");
                movementDAO.recordMovement(sm, conn);

                conn.commit();
                return true;
            } catch (Exception e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        }
    }

    public Map<String, Object> getDashboardMetrics() throws SQLException {
        List<Product> products = productDAO.getAllProducts();
        List<RestockRecommendation> recs = predictorService.generateRestockRecommendations();

        int totalProducts = products.size();
        int totalUnitsInStock = 0;
        double totalInventoryValue = 0.0;
        int criticalCount = 0;
        int warningCount = 0;

        for (Product p : products) {
            totalUnitsInStock += p.getCurrentStock();
            totalInventoryValue += (p.getCurrentStock() * p.getCostPrice());
        }

        for (RestockRecommendation r : recs) {
            if ("CRITICAL".equalsIgnoreCase(r.getUrgencyStatus())) {
                criticalCount++;
            } else if ("WARNING".equalsIgnoreCase(r.getUrgencyStatus())) {
                warningCount++;
            }
        }

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalProducts", totalProducts);
        metrics.put("totalUnitsInStock", totalUnitsInStock);
        metrics.put("totalInventoryValue", Math.round(totalInventoryValue * 100.0) / 100.0);
        metrics.put("criticalAlerts", criticalCount);
        metrics.put("warningAlerts", warningCount);
        metrics.put("optimalCount", totalProducts - criticalCount - warningCount);

        return metrics;
    }
}
