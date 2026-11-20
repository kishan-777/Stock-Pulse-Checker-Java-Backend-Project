package com.inventory;

import com.inventory.controller.HttpApiServer;
import com.inventory.dao.DBConnection;

/**
 * Main Application Entry Point
 * Demonstrates starting the Java backend server.
 */
public class MainServer {
    private static final int DEFAULT_PORT = 8080;

    public static void main(String[] args) {
        System.out.println("==================================================================");
        System.out.println("   SMART INVENTORY DEMAND PREDICTOR - SYSTEM INITIALIZATION");
        System.out.println("==================================================================");

        // Check if DB credentials were provided via CLI arguments: java MainServer [port] [dbUser] [dbPass]
        if (args.length >= 3) {
            String dbUser = args[1];
            String dbPass = args[2];
            DBConnection.getInstance().configure(dbUser, dbPass);
        }

        System.out.println("[Init] Testing MySQL Database Connection...");
        boolean connected = DBConnection.getInstance().testConnection();
        if (connected) {
            System.out.println("[Init] SUCCESS: Connected to MySQL database 'smart_inventory_db'.");
        } else {
            System.err.println("[Init] WARNING: Could not connect to MySQL using default credentials (root/root).");
            System.err.println("[Init] Please ensure MySQL service is running and 'smart_inventory_db' is imported in MySQL Workbench.");
            System.err.println("[Init] You can run: run.bat <dbPassword> to supply your custom MySQL password.");
        }

        int port = DEFAULT_PORT;
        if (args.length >= 1) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (NumberFormatException ignored) {}
        }

        try {
            HttpApiServer apiServer = new HttpApiServer(port);
            apiServer.start();

            // Register graceful shutdown hook
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                System.out.println("\n[Shutdown] Stopping server...");
                apiServer.stop();
                System.out.println("[Shutdown] Server stopped cleanly.");
            }));

        } catch (Exception e) {
            System.err.println("[Fatal Error] Failed to launch server: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
