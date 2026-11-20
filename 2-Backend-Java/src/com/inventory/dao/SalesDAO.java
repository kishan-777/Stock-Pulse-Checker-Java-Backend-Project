package com.inventory.dao;

import com.inventory.exception.InsufficientStockException;
import com.inventory.model.Product;
import com.inventory.model.Sale;
import com.inventory.model.SaleItem;
import com.inventory.model.StockMovement;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Sales Data Access Object
 * Demonstrates:
 * 1. JDBC Database Transactions (ACID compliance: setAutoCommit(false), commit(), rollback())
 * 2. Atomic Stock Deductions & Movement Logging
 */
public class SalesDAO {
    private final DBConnection db = DBConnection.getInstance();
    private final ProductDAO productDAO = new ProductDAO();
    private final StockMovementDAO movementDAO = new StockMovementDAO();

    /**
     * Executes a complete Sale transaction atomically.
     * If any product has insufficient stock, or if any query fails, the entire transaction is rolled back.
     */
    public boolean processSaleTransaction(Sale sale) throws SQLException, InsufficientStockException {
        String insertSaleSql = "INSERT INTO sales (invoice_no, total_amount, customer_name, payment_mode) VALUES (?, ?, ?, ?)";
        String insertItemSql = "INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = db.getConnection()) {
            try {
                // BEGIN TRANSACTION
                conn.setAutoCommit(false);

                // 1. Verify stock availability for all items before making any modifications
                for (SaleItem item : sale.getItems()) {
                    Product p = productDAO.getProductById(item.getProductId());
                    if (p == null) {
                        throw new SQLException("Product with ID " + item.getProductId() + " does not exist.");
                    }
                    if (p.getCurrentStock() < item.getQuantity()) {
                        throw new InsufficientStockException(p.getProductId(), item.getQuantity(), p.getCurrentStock());
                    }
                }

                // 2. Insert Sale Header
                int saleId = 0;
                try (PreparedStatement psSale = conn.prepareStatement(insertSaleSql, Statement.RETURN_GENERATED_KEYS)) {
                    psSale.setString(1, sale.getInvoiceNo());
                    psSale.setDouble(2, sale.getTotalAmount());
                    psSale.setString(3, sale.getCustomerName());
                    psSale.setString(4, sale.getPaymentMode());
                    psSale.executeUpdate();
                    try (ResultSet keys = psSale.getGeneratedKeys()) {
                        if (keys.next()) {
                            saleId = keys.getInt(1);
                            sale.setSaleId(saleId);
                        }
                    }
                }

                // 3. Insert Items, Deduct Stock, and Record Stock Movements
                try (PreparedStatement psItem = conn.prepareStatement(insertItemSql)) {
                    for (SaleItem item : sale.getItems()) {
                        item.setSaleId(saleId);
                        psItem.setInt(1, saleId);
                        psItem.setInt(2, item.getProductId());
                        psItem.setInt(3, item.getQuantity());
                        psItem.setDouble(4, item.getUnitPrice());
                        psItem.setDouble(5, item.getSubtotal());
                        psItem.addBatch();

                        // Deduct stock atomically
                        boolean updated = productDAO.updateStockDelta(item.getProductId(), -item.getQuantity(), conn);
                        if (!updated) {
                            throw new SQLException("Stock update failed for product ID " + item.getProductId());
                        }

                        // Record Stock-Out movement
                        StockMovement sm = new StockMovement(
                            item.getProductId(),
                            "OUT",
                            item.getQuantity(),
                            "Sale Invoice: " + sale.getInvoiceNo()
                        );
                        movementDAO.recordMovement(sm, conn);
                    }
                    psItem.executeBatch();
                }

                // COMMIT TRANSACTION
                conn.commit();
                return true;

            } catch (Exception ex) {
                // ROLLBACK ON ANY ERROR
                conn.rollback();
                if (ex instanceof InsufficientStockException) {
                    throw (InsufficientStockException) ex;
                }
                throw new SQLException("Sale transaction rolled back due to error: " + ex.getMessage(), ex);
            } finally {
                conn.setAutoCommit(true);
            }
        }
    }

    /**
     * Retrieves historical quantity sold per product over the last N days.
     * Crucial for the Demand Predictor Moving Average / Velocity calculation.
     */
    public Map<Integer, Integer> getUnitsSoldInLastDays(int days) throws SQLException {
        Map<Integer, Integer> map = new HashMap<>();
        String sql = "SELECT si.product_id, SUM(si.quantity) AS total_sold " +
                     "FROM sale_items si " +
                     "JOIN sales s ON si.sale_id = s.sale_id " +
                     "WHERE s.sale_date >= DATE_SUB(NOW(), INTERVAL ? DAY) " +
                     "GROUP BY si.product_id";
        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, days);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    map.put(rs.getInt("product_id"), rs.getInt("total_sold"));
                }
            }
        }
        return map;
    }

    public List<Sale> getRecentSales(int limit) throws SQLException {
        List<Sale> list = new ArrayList<>();
        String sql = "SELECT * FROM sales ORDER BY sale_date DESC LIMIT ?";
        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, limit);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Sale s = new Sale();
                    s.setSaleId(rs.getInt("sale_id"));
                    s.setInvoiceNo(rs.getString("invoice_no"));
                    s.setSaleDate(rs.getTimestamp("sale_date"));
                    s.setTotalAmount(rs.getDouble("total_amount"));
                    s.setCustomerName(rs.getString("customer_name"));
                    s.setPaymentMode(rs.getString("payment_mode"));
                    list.add(s);
                }
            }
        }
        return list;
    }
}
