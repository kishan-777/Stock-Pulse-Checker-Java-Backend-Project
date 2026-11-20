package com.inventory;

import com.inventory.dao.*;
import com.inventory.exception.InsufficientStockException;
import com.inventory.model.*;
import com.inventory.service.DemandPredictorService;
import com.inventory.service.InventoryService;
import com.inventory.controller.HttpApiServer;

import java.sql.SQLException;
import java.util.*;

/**
 * =========================================================================
 * Smart Inventory Demand Predictor - Terminal / CLI Edition
 * =========================================================================
 * Designed for Console/Terminal evaluation, Viva demonstrations, and direct
 * Java interaction in the VS Code terminal.
 * 
 * Demonstrates Core Java & OOP Concepts:
 * - OOP: Encapsulation, Inheritance, Exception Handling, Collections Framework
 * - Design Patterns: DAO (Data Access Object) Pattern, Singleton Pattern
 * - JDBC: PreparedStatement, Transaction Management (Commit & Rollback)
 * - Mathematical Models: Reorder Point (ROP) & Moving Average Sales Velocity
 * =========================================================================
 */
public class InventoryTerminalApp {
    private static final Scanner scanner = new Scanner(System.in);
    private static final ProductDAO productDAO = new ProductDAO();
    private static final CategoryDAO categoryDAO = new CategoryDAO();
    private static final StockMovementDAO movementDAO = new StockMovementDAO();
    private static final SalesDAO salesDAO = new SalesDAO();
    private static final DemandPredictorService predictorService = new DemandPredictorService();
    private static final InventoryService inventoryService = new InventoryService();

    public static void main(String[] args) {
        // Test database connection on startup
        System.out.println("Connecting to MySQL Database...");
        if (!DBConnection.getInstance().testConnection()) {
            System.out.println("[WARNING] Cannot connect to MySQL using default credentials.");
            System.out.print("Enter MySQL root password (or press Enter if blank/root): ");
            String pass = scanner.nextLine().trim();
            if (!pass.isEmpty()) {
                DBConnection.getInstance().configure("root", pass);
            }
        }

        boolean running = true;
        while (running) {
            printBanner();
            printMenu();
            System.out.print("\nEnter your choice [0 - 10]: ");
            String choice = scanner.nextLine().trim();

            try {
                switch (choice) {
                    case "1": viewAllProducts(); break;
                    case "2": addNewProduct(); break;
                    case "3": updateProduct(); break;
                    case "4": deleteProduct(); break;
                    case "5": recordStockIn(); break;
                    case "6": recordStockOut(); break;
                    case "7": processNewSale(); break;
                    case "8": runDemandPredictor(); break;
                    case "9": generateInventoryReport(); break;
                    case "10": startWebServer(); break;
                    case "0":
                        System.out.println("\nExiting Smart Inventory CLI. Thank you!");
                        running = false;
                        break;
                    default:
                        System.out.println("\n[!] Invalid option. Please select a number from 0 to 10.");
                }
            } catch (Exception e) {
                System.out.println("\n[ERROR] An error occurred: " + e.getMessage());
            }

            if (running) {
                System.out.println("\nPress [ENTER] to return to the main menu...");
                if (scanner.hasNextLine()) {
                    scanner.nextLine();
                } else {
                    break;
                }
            }
        }
    }

    private static void printBanner() {
        System.out.println("\n" + "=".repeat(75));
        System.out.println("        SMART INVENTORY DEMAND PREDICTOR - TERMINAL INTERFACE");
        System.out.println("              [ Java Core + JDBC + MySQL + OOPs ]");
        System.out.println("=".repeat(75));
    }

    private static void printMenu() {
        System.out.println(" [1]  List All Products & Current Stock");
        System.out.println(" [2]  Add New Product to Catalog");
        System.out.println(" [3]  Update Existing Product");
        System.out.println(" [4]  Delete Product from Catalog");
        System.out.println(" [5]  Record Stock-In (Supplier Shipment Received)");
        System.out.println(" [6]  Record Stock-Out (Damage / Write-off / Sample)");
        System.out.println(" [7]  Process New Counter Sale (ACID Transaction & Invoice)");
        System.out.println(" [8]  Run Demand Predictor & ROP Replenishment Engine  <-- [VIVA STAR]");
        System.out.println(" [9]  Generate Inventory Valuation & Analytics Report");
        System.out.println(" [10] Start Background Web Server (:8080) for React UI");
        System.out.println(" [0]  Exit Program");
        System.out.println("-".repeat(75));
    }

    // 1. View All Products
    private static void viewAllProducts() throws SQLException {
        List<Product> list = productDAO.getAllProducts();
        System.out.println("\n--- PRODUCT INVENTORY CATALOG (" + list.size() + " ITEMS) ---");
        System.out.printf("%-4s | %-16s | %-30s | %-12s | %-8s | %-8s | %-6s\n",
                "ID", "SKU", "Product Name", "Category", "Stock", "Price", "LeadT");
        System.out.println("-".repeat(95));
        for (Product p : list) {
            System.out.printf("%-4d | %-16s | %-30s | %-12s | %-8d | Rs.%-5.2f | %-4dd\n",
                    p.getProductId(),
                    p.getSku(),
                    truncate(p.getName(), 30),
                    p.getCategoryName() != null ? truncate(p.getCategoryName(), 12) : "General",
                    p.getCurrentStock(),
                    p.getUnitPrice(),
                    p.getLeadTimeDays());
        }
    }

    // 2. Add New Product
    private static void addNewProduct() throws SQLException {
        System.out.println("\n--- ADD NEW PRODUCT ---");
        System.out.print("Enter Product Name: ");
        String name = scanner.nextLine().trim();
        System.out.print("Enter SKU Code (e.g. ELEC-MOUSE-01): ");
        String sku = scanner.nextLine().trim();
        System.out.print("Enter Unit Selling Price (Rs.): ");
        double price = Double.parseDouble(scanner.nextLine().trim());
        System.out.print("Enter Unit Cost Price (Rs.): ");
        double cost = Double.parseDouble(scanner.nextLine().trim());
        System.out.print("Enter Initial Stock Quantity: ");
        int stock = Integer.parseInt(scanner.nextLine().trim());
        System.out.print("Enter Supplier Lead Time in Days (default 3): ");
        int lead = Integer.parseInt(scanner.nextLine().trim());
        System.out.print("Enter Safety Stock Buffer Units (default 5): ");
        int safety = Integer.parseInt(scanner.nextLine().trim());
        System.out.print("Enter Target Stock Coverage Days (default 30): ");
        int target = Integer.parseInt(scanner.nextLine().trim());

        Product p = new Product(0, sku, name, null, price, cost, stock, lead, safety, target);
        boolean added = productDAO.addProduct(p);
        if (added) {
            System.out.println("\n[SUCCESS] Product '" + name + "' added successfully with ID: " + p.getProductId());
        } else {
            System.out.println("\n[FAIL] Could not insert product into database.");
        }
    }

    // 3. Update Product
    private static void updateProduct() throws SQLException {
        viewAllProducts();
        System.out.print("\nEnter Product ID to Update: ");
        int id = Integer.parseInt(scanner.nextLine().trim());
        Product p = productDAO.getProductById(id);
        if (p == null) {
            System.out.println("[!] Product not found.");
            return;
        }

        System.out.print("New Name (Current: " + p.getName() + ") [Enter to keep]: ");
        String name = scanner.nextLine().trim();
        if (!name.isEmpty()) p.setName(name);

        System.out.print("New Selling Price (Current: Rs." + p.getUnitPrice() + ") [Enter to keep]: ");
        String price = scanner.nextLine().trim();
        if (!price.isEmpty()) p.setUnitPrice(Double.parseDouble(price));

        System.out.print("New Lead Time Days (Current: " + p.getLeadTimeDays() + "d) [Enter to keep]: ");
        String lead = scanner.nextLine().trim();
        if (!lead.isEmpty()) p.setLeadTimeDays(Integer.parseInt(lead));

        System.out.print("New Safety Stock (Current: " + p.getSafetyStock() + "u) [Enter to keep]: ");
        String safety = scanner.nextLine().trim();
        if (!safety.isEmpty()) p.setSafetyStock(Integer.parseInt(safety));

        boolean updated = productDAO.updateProduct(p);
        if (updated) {
            System.out.println("[SUCCESS] Product details updated in MySQL.");
        } else {
            System.out.println("[FAIL] Update failed.");
        }
    }

    // 4. Delete Product
    private static void deleteProduct() throws SQLException {
        viewAllProducts();
        System.out.print("\nEnter Product ID to Delete: ");
        int id = Integer.parseInt(scanner.nextLine().trim());
        System.out.print("Are you sure you want to delete Product #" + id + "? (y/n): ");
        String confirm = scanner.nextLine().trim();
        if ("y".equalsIgnoreCase(confirm)) {
            boolean deleted = productDAO.deleteProduct(id);
            if (deleted) {
                System.out.println("[SUCCESS] Product deleted from inventory.");
            } else {
                System.out.println("[FAIL] Could not delete product.");
            }
        }
    }

    // 5. Record Stock-In
    private static void recordStockIn() throws SQLException {
        viewAllProducts();
        System.out.print("\nEnter Product ID receiving stock: ");
        int id = Integer.parseInt(scanner.nextLine().trim());
        System.out.print("Enter Quantity to Add: ");
        int qty = Integer.parseInt(scanner.nextLine().trim());
        System.out.print("Enter Supplier / Invoice Notes: ");
        String notes = scanner.nextLine().trim();

        boolean ok = inventoryService.recordStockIn(id, qty, notes);
        if (ok) {
            System.out.println("[SUCCESS] Added " + qty + " units to stock. Logged in stock_movements.");
        }
    }

    // 6. Record Stock-Out
    private static void recordStockOut() throws SQLException, InsufficientStockException {
        viewAllProducts();
        System.out.print("\nEnter Product ID for stock deduction: ");
        int id = Integer.parseInt(scanner.nextLine().trim());
        System.out.print("Enter Quantity to Deduct: ");
        int qty = Integer.parseInt(scanner.nextLine().trim());
        System.out.print("Enter Reason (e.g. Expired / Damaged in warehouse): ");
        String reason = scanner.nextLine().trim();

        boolean ok = inventoryService.recordStockOut(id, qty, reason);
        if (ok) {
            System.out.println("[SUCCESS] Deducted " + qty + " units. Updated current_stock.");
        }
    }

    // 7. Process New Sale
    private static void processNewSale() throws SQLException, InsufficientStockException {
        viewAllProducts();
        System.out.print("\nEnter Product ID being sold: ");
        int id = Integer.parseInt(scanner.nextLine().trim());
        Product p = productDAO.getProductById(id);
        if (p == null) {
            System.out.println("[!] Product not found.");
            return;
        }

        System.out.println("Selected: " + p.getName() + " | Stock Available: " + p.getCurrentStock() + " units | Unit Price: Rs." + p.getUnitPrice());
        System.out.print("Enter Quantity to Buy: ");
        int qty = Integer.parseInt(scanner.nextLine().trim());

        if (qty > p.getCurrentStock()) {
            throw new InsufficientStockException(p.getProductId(), qty, p.getCurrentStock());
        }

        System.out.print("Customer Name [Press enter for Walk-in]: ");
        String customer = scanner.nextLine().trim();
        if (customer.isEmpty()) customer = "Walk-in Customer";

        System.out.print("Payment Mode (Cash / UPI / Card): ");
        String payment = scanner.nextLine().trim();
        if (payment.isEmpty()) payment = "UPI";

        Sale sale = new Sale("INV-" + (System.currentTimeMillis() % 1000000), qty * p.getUnitPrice(), customer, payment);
        SaleItem item = new SaleItem(p.getProductId(), qty, p.getUnitPrice());
        sale.addItem(item);

        System.out.println("\nExecuting atomic JDBC transaction...");
        salesDAO.processSaleTransaction(sale);

        System.out.println("\n" + "=".repeat(50));
        System.out.println("            SALES INVOICE GENERATED");
        System.out.println("=".repeat(50));
        System.out.println(" Invoice No : " + sale.getInvoiceNo());
        System.out.println(" Customer   : " + customer);
        System.out.println(" Payment    : " + payment);
        System.out.println(" Item Sold  : " + p.getName() + " (x" + qty + ")");
        System.out.printf(" Total Paid : Rs. %.2f\n", (qty * p.getUnitPrice()));
        System.out.println(" New Stock  : " + (p.getCurrentStock() - qty) + " units remaining");
        System.out.println("=".repeat(50));
    }

    // 8. Run Demand Predictor
    private static void runDemandPredictor() throws SQLException {
        System.out.println("\n" + "=".repeat(95));
        System.out.println("              SMART DEMAND PREDICTOR & REORDER POINT (ROP) ANALYSIS");
        System.out.println(" Formula 1: ROP = (Average Daily Sales * Lead Time) + Safety Stock");
        System.out.println(" Formula 2: Suggested Restock = (Target Stock Days * ADS) - Current Stock");
        System.out.println("=".repeat(95));

        List<RestockRecommendation> recs = predictorService.generateRestockRecommendations();
        System.out.printf("%-24s | %-6s | %-6s | %-6s | %-8s | %-9s | %-12s | %-10s\n",
                "Product", "Stock", "ADS", "LeadT", "ROP", "Days Left", "Suggest Order", "Urgency");
        System.out.println("-".repeat(95));

        for (RestockRecommendation r : recs) {
            String urgencyTag = r.getUrgencyStatus();
            if ("CRITICAL".equals(urgencyTag)) urgencyTag = "[! CRITICAL !]";
            else if ("WARNING".equals(urgencyTag)) urgencyTag = "[? WARNING ?]";
            else urgencyTag = "[ OK ]";

            System.out.printf("%-24s | %-6d | %-6.2f | %-4dd | %-8d | %-7.1fd | +%-10d | %-10s\n",
                    truncate(r.getProductName(), 24),
                    r.getCurrentStock(),
                    r.getAverageDailySales(),
                    r.getLeadTimeDays(),
                    r.getReorderPoint(),
                    r.getDaysOfSupplyRemaining(),
                    r.getSuggestedRestockQuantity(),
                    urgencyTag);
        }

        System.out.println("=".repeat(95));
        System.out.println("Items marked CRITICAL have stock at or below safety buffer. Reorder immediately!");
    }

    // 9. Generate Inventory Report
    private static void generateInventoryReport() throws SQLException {
        Map<String, Object> metrics = inventoryService.getDashboardMetrics();
        System.out.println("\n" + "=".repeat(55));
        System.out.println("         INVENTORY AUDIT & VALUATION REPORT");
        System.out.println("=".repeat(55));
        System.out.println(" Total Catalog Products       : " + metrics.get("totalProducts"));
        System.out.println(" Total Physical Units on Shelf : " + metrics.get("totalUnitsInStock") + " units");
        System.out.println(" Total Valuation (Cost Basis)  : Rs. " + metrics.get("totalInventoryValue"));
        System.out.println(" Critical Stockout Alerts      : " + metrics.get("criticalAlerts") + " items");
        System.out.println(" ROP Reorder Warnings          : " + metrics.get("warningAlerts") + " items");
        System.out.println(" Healthy Stock Levels          : " + metrics.get("optimalCount") + " items");
        System.out.println("=".repeat(55));
    }

    // 10. Start Web Server
    private static void startWebServer() {
        System.out.println("\n[WebServer] Starting REST API Server on port 8080...");
        try {
            HttpApiServer server = new HttpApiServer(8080);
            server.start();
            System.out.println("[WebServer] Server running! React frontend can now connect to http://localhost:8080");
        } catch (Exception e) {
            System.out.println("[WebServer ERROR] " + e.getMessage());
        }
    }

    private static String truncate(String text, int max) {
        if (text == null) return "";
        return text.length() <= max ? text : text.substring(0, max - 3) + "...";
    }
}
