package com.inventory.dao;

import com.inventory.model.StockMovement;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * StockMovement Data Access Object
 */
public class StockMovementDAO {
    private final DBConnection db = DBConnection.getInstance();

    public boolean recordMovement(StockMovement m, Connection conn) throws SQLException {
        String sql = "INSERT INTO stock_movements (product_id, movement_type, quantity, reason) VALUES (?, ?, ?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, m.getProductId());
            ps.setString(2, m.getMovementType());
            ps.setInt(3, m.getQuantity());
            ps.setString(4, m.getReason());
            int affected = ps.executeUpdate();
            if (affected > 0) {
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    if (keys.next()) {
                        m.setMovementId(keys.getInt(1));
                    }
                }
                return true;
            }
        }
        return false;
    }

    public List<StockMovement> getRecentMovements(int limit) throws SQLException {
        List<StockMovement> list = new ArrayList<>();
        String sql = "SELECT sm.*, p.name AS product_name, p.sku " +
                     "FROM stock_movements sm " +
                     "JOIN products p ON sm.product_id = p.product_id " +
                     "ORDER BY sm.movement_date DESC LIMIT ?";
        try (Connection conn = db.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, limit);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    StockMovement m = new StockMovement();
                    m.setMovementId(rs.getInt("movement_id"));
                    m.setProductId(rs.getInt("product_id"));
                    m.setProductName(rs.getString("product_name"));
                    m.setSku(rs.getString("sku"));
                    m.setMovementType(rs.getString("movement_type"));
                    m.setQuantity(rs.getInt("quantity"));
                    m.setReason(rs.getString("reason"));
                    m.setMovementDate(rs.getTimestamp("movement_date"));
                    list.add(m);
                }
            }
        }
        return list;
    }
}
