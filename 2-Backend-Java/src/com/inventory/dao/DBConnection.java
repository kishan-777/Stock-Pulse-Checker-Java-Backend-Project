package com.inventory.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * DBConnection - Database Connection Manager
 * Demonstrates Design Pattern: Singleton Pattern
 * 
 * Ensures a single point of database connectivity across the application,
 * reusing connection parameters and maintaining clean resource management.
 */
public class DBConnection {
    private static DBConnection instance;

    // Database credentials (can also be overridden via system properties or environment variables)
    private static final String DEFAULT_URL = "jdbc:mysql://localhost:3306/smart_inventory_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String DEFAULT_USER = "root";
    private static final String DEFAULT_PASS = "root"; // Common default, easily updated if student uses custom password

    private String dbUrl;
    private String dbUser;
    private String dbPassword;

    private DBConnection() {
        this.dbUrl = System.getenv("DB_URL") != null ? System.getenv("DB_URL") : DEFAULT_URL;
        this.dbUser = System.getenv("DB_USER") != null ? System.getenv("DB_USER") : DEFAULT_USER;
        this.dbPassword = System.getenv("DB_PASSWORD") != null ? System.getenv("DB_PASSWORD") : DEFAULT_PASS;

        try {
            // Load MySQL 8+ JDBC Driver class
            Class.forName("com.mysql.cj.jdbc.Driver");
            System.out.println("[DBConnection] MySQL JDBC Driver registered successfully.");
        } catch (ClassNotFoundException e) {
            System.err.println("[DBConnection ERROR] MySQL JDBC Driver not found in classpath!");
            e.printStackTrace();
        }
    }

    /**
     * Singleton accessor
     */
    public static synchronized DBConnection getInstance() {
        if (instance == null) {
            instance = new DBConnection();
        }
        return instance;
    }

    /**
     * Returns a new active SQL Connection
     */
    public Connection getConnection() throws SQLException {
        return DriverManager.getConnection(this.dbUrl, this.dbUser, this.dbPassword);
    }

    /**
     * Allows dynamic setting of DB credentials if user uses a custom password in MySQL Workbench
     */
    public void configure(String user, String password) {
        this.dbUser = user;
        this.dbPassword = password;
        System.out.println("[DBConnection] Updated database credentials for user: " + user);
    }

    public boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed();
        } catch (SQLException e) {
            System.err.println("[DBConnection ERROR] Connection test failed: " + e.getMessage());
            return false;
        }
    }
}
