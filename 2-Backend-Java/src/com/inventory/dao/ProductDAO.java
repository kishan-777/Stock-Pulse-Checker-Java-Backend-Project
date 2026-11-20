package com.inventory.dao;

import com.inventory.model.Product;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Product Data Access Object (DAO)
 * Handles full CRUD operations on Products table via JDBC PreparedStatement
 */
public class ProductDAO {
    private final DBConnection db = DBConnection.getInstance();

    private Product mapRow(ResultSet rs) throws SQLException {
        Product p = new Product();
        p.setProductId(rs.getInt("product_id"));
        p.setSku(rs.getString("sku"));
        p.setName(rs.getString("name"));
        int catId = rs.getInt("category_id");
        p.setCategoryId(rs.wasNull() ? null : catId);
        p.setCategoryName(rs.getString("category_name"));
        p.setUnitPrice(rs.getDouble("unit_price"));
        p.setCostPrice(rs.getDouble("cost_price"));
        p.setCurrentStock(rs.getInt("current_stock"));
        p.setLeadTimeDays(rs.getInt("lead_time_days"));
        p.setSafetyStock(rs.getInt("safety_stock"));
        p.setTargetStockDays(rs.getInt("target_stock_days"));
        p.setCreatedAt(rs.getTimestamp("created_at"));
        p.setUpdatedAt(rs.getTimestamp("updated_at"));
        return p;
    }

    public List<Product> getAllProducts() throws SQLException {
        List<Product> list = new ArrayList<>();
        String sql = "SELECT p.*, c.name AS category_name " +
                     "FROM products p " +
                     "LEFT JOIN categories c ON p.category_id = c.category_id " +
                     "ORDER BY p.name ASC";
        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapRow(rs));
            }
        }
        return list;
    }

    public Product getProductById(int productId) throws SQLException {
        String sql = "SELECT p.*, c.name AS category_name " +
                     "FROM products p " +
                     "LEFT JOIN categories c ON p.category_id = c.category_id " +
                     "WHERE p.product_id = ?";
        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, productId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        }
        return null;
    }

    public boolean addProduct(Product p) throws SQLException {
        String sql = "INSERT INTO products (sku, name, category_id, unit_price, cost_price, current_stock, " +
                     "lead_time_days, safety_stock, target_stock_days) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, p.getSku());
            ps.setString(2, p.getName());
            if (p.getCategoryId() != null) {
                ps.setInt(3, p.getCategoryId());
            } else {
                ps.setNull(3, Types.INTEGER);
            }
            ps.setDouble(4, p.getUnitPrice());
            ps.setDouble(5, p.getCostPrice());
            ps.setInt(6, p.getCurrentStock());
            ps.setInt(7, p.getLeadTimeDays());
            ps.setInt(8, p.getSafetyStock());
            ps.setInt(9, p.getTargetStockDays());

            int affected = ps.executeUpdate();
            if (affected > 0) {
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    if (keys.next()) {
                        p.setProductId(keys.getInt(1));
                    }
                }
                return true;
            }
        }
        return false;
    }

    public boolean updateProduct(Product p) throws SQLException {
        String sql = "UPDATE products SET name = ?, category_id = ?, unit_price = ?, cost_price = ?, " +
                     "lead_time_days = ?, safety_stock = ?, target_stock_days = ? WHERE product_id = ?";
        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, p.getName());
            if (p.getCategoryId() != null) {
                ps.setInt(2, p.getCategoryId());
            } else {
                ps.setNull(2, Types.INTEGER);
            }
            ps.setDouble(3, p.getUnitPrice());
            ps.setDouble(4, p.getCostPrice());
            ps.setInt(5, p.getLeadTimeDays());
            ps.setInt(6, p.getSafetyStock());
            ps.setInt(7, p.getTargetStockDays());
            ps.setInt(8, p.getProductId());

            return ps.executeUpdate() > 0;
        }
    }

    public boolean deleteProduct(int productId) throws SQLException {
        String sql = "DELETE FROM products WHERE product_id = ?";
        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, productId);
            return ps.executeUpdate() > 0;
        }
    }

    /**
     * Atomically adjusts current_stock by delta (positive for stock-in, negative for sales/stock-out).
     * Accepts external Connection to participate in larger transactions.
     */
    public boolean updateStockDelta(int productId, int deltaQuantity, Connection conn) throws SQLException {
        String sql = "UPDATE products SET current_stock = current_stock + ? WHERE product_id = ? AND (current_stock + ?) >= 0";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, deltaQuantity);
            ps.setInt(2, productId);
            ps.setInt(3, deltaQuantity);
            return ps.executeUpdate() > 0;
        }
    }
}
