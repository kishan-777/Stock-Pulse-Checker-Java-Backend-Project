package com.inventory.controller;

import com.inventory.dao.*;
import com.inventory.exception.InsufficientStockException;
import com.inventory.model.*;
import com.inventory.service.DemandPredictorService;
import com.inventory.service.InventoryService;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.sql.SQLException;
import java.util.*;

/**
 * HttpApiServer
 * Implements RESTful JSON endpoints for the React frontend.
 * Automatically injects Cross-Origin Resource Sharing (CORS) headers.
 */
public class HttpApiServer {
    private final int port;
    private HttpServer server;

    private final ProductDAO productDAO = new ProductDAO();
    private final CategoryDAO categoryDAO = new CategoryDAO();
    private final StockMovementDAO movementDAO = new StockMovementDAO();
    private final SalesDAO salesDAO = new SalesDAO();
    private final DemandPredictorService predictorService = new DemandPredictorService();
    private final InventoryService inventoryService = new InventoryService();

    public HttpApiServer(int port) {
        this.port = port;
    }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);

        // Register REST Routes
        server.createContext("/api/health", new HealthHandler());
        server.createContext("/api/categories", new CategoryHandler());
        server.createContext("/api/products", new ProductHandler());
        server.createContext("/api/stock/in", new StockInHandler());
        server.createContext("/api/stock/out", new StockOutHandler());
        server.createContext("/api/stock/movements", new StockMovementsHandler());
        server.createContext("/api/sales", new SalesHandler());
        server.createContext("/api/predictions", new PredictionHandler());
        server.createContext("/api/dashboard/metrics", new DashboardMetricsHandler());

        server.setExecutor(java.util.concurrent.Executors.newFixedThreadPool(10));
        server.start();
        System.out.println("==================================================================");
        System.out.println(" Smart Inventory Demand Predictor - Java Backend Server Started");
        System.out.println(" Listening on: http://localhost:" + port);
        System.out.println(" Available APIs:");
        System.out.println("   GET  /api/health");
        System.out.println("   GET  /api/categories");
        System.out.println("   GET  /api/products");
        System.out.println("   GET  /api/predictions (Demand Prediction & Restock Math)");
        System.out.println("   GET  /api/dashboard/metrics");
        System.out.println("==================================================================");
    }

    public void stop() {
        if (server != null) {
            server.stop(0);
        }
    }

    // =========================================================================
    // HTTP Helpers (CORS, Request Body reading, JSON response writing)
    // =========================================================================

    private static void handleCors(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    }

    private static boolean isPreflight(HttpExchange exchange) throws IOException {
        handleCors(exchange);
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return true;
        }
        return false;
    }

    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String jsonResponse) throws IOException {
        handleCors(exchange);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        byte[] bytes = jsonResponse.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static void sendError(HttpExchange exchange, int statusCode, String message) throws IOException {
        sendJsonResponse(exchange, statusCode, "{\"error\":\"" + message.replace("\"", "\\\"") + "\"}");
    }

    private static String readRequestBody(HttpExchange exchange) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        }
    }

    // =========================================================================
    // Handlers
    // =========================================================================

    private class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (isPreflight(exchange)) return;
            boolean dbOk = DBConnection.getInstance().testConnection();
            String json = String.format("{\"status\":\"UP\",\"databaseConnected\":%b,\"timestamp\":\"%s\"}",
                dbOk, new java.util.Date().toString());
            sendJsonResponse(exchange, 200, json);
        }
    }

    private class CategoryHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (isPreflight(exchange)) return;
            try {
                if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                    List<Category> list = categoryDAO.getAllCategories();
                    sendJsonResponse(exchange, 200, JsonUtil.toJson(list));
                } else if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                    String body = readRequestBody(exchange);
                    Map<String, String> map = JsonUtil.parseSimpleJson(body);
                    Category c = new Category(0, map.get("name"), map.get("description"));
                    categoryDAO.addCategory(c);
                    sendJsonResponse(exchange, 201, JsonUtil.toJson(c));
                } else {
                    sendError(exchange, 405, "Method Not Allowed");
                }
            } catch (Exception e) {
                sendError(exchange, 500, e.getMessage());
            }
        }
    }

    private class ProductHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (isPreflight(exchange)) return;
            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();

            try {
                if ("GET".equalsIgnoreCase(method)) {
                    List<Product> list = productDAO.getAllProducts();
                    sendJsonResponse(exchange, 200, JsonUtil.toJson(list));
                } else if ("POST".equalsIgnoreCase(method)) {
                    String body = readRequestBody(exchange);
                    Map<String, String> map = JsonUtil.parseSimpleJson(body);

                    Product p = new Product();
                    p.setSku(map.getOrDefault("sku", "SKU-" + System.currentTimeMillis()));
                    p.setName(map.getOrDefault("name", "Unnamed Product"));
                    if (map.containsKey("categoryId") && !map.get("categoryId").equals("null")) {
                        p.setCategoryId(Integer.parseInt(map.get("categoryId")));
                    }
                    p.setUnitPrice(Double.parseDouble(map.getOrDefault("unitPrice", "0")));
                    p.setCostPrice(Double.parseDouble(map.getOrDefault("costPrice", "0")));
                    p.setCurrentStock(Integer.parseInt(map.getOrDefault("currentStock", "0")));
                    p.setLeadTimeDays(Integer.parseInt(map.getOrDefault("leadTimeDays", "3")));
                    p.setSafetyStock(Integer.parseInt(map.getOrDefault("safetyStock", "5")));
                    p.setTargetStockDays(Integer.parseInt(map.getOrDefault("targetStockDays", "30")));

                    productDAO.addProduct(p);
                    sendJsonResponse(exchange, 201, JsonUtil.toJson(p));
                } else if ("PUT".equalsIgnoreCase(method)) {
                    String body = readRequestBody(exchange);
                    Map<String, String> map = JsonUtil.parseSimpleJson(body);
                    int productId = Integer.parseInt(map.get("productId"));

                    Product p = productDAO.getProductById(productId);
                    if (p == null) {
                        sendError(exchange, 404, "Product not found");
                        return;
                    }
                    p.setName(map.getOrDefault("name", p.getName()));
                    if (map.containsKey("categoryId")) {
                        p.setCategoryId(Integer.parseInt(map.get("categoryId")));
                    }
                    p.setUnitPrice(Double.parseDouble(map.getOrDefault("unitPrice", String.valueOf(p.getUnitPrice()))));
                    p.setCostPrice(Double.parseDouble(map.getOrDefault("costPrice", String.valueOf(p.getCostPrice()))));
                    p.setLeadTimeDays(Integer.parseInt(map.getOrDefault("leadTimeDays", String.valueOf(p.getLeadTimeDays()))));
                    p.setSafetyStock(Integer.parseInt(map.getOrDefault("safetyStock", String.valueOf(p.getSafetyStock()))));
                    p.setTargetStockDays(Integer.parseInt(map.getOrDefault("targetStockDays", String.valueOf(p.getTargetStockDays()))));

                    productDAO.updateProduct(p);
                    sendJsonResponse(exchange, 200, JsonUtil.toJson(p));
                } else if ("DELETE".equalsIgnoreCase(method)) {
                    // Extract ID from query param ?id=X
                    String query = exchange.getRequestURI().getQuery();
                    if (query != null && query.contains("id=")) {
                        int id = Integer.parseInt(query.split("id=")[1].split("&")[0]);
                        productDAO.deleteProduct(id);
                        sendJsonResponse(exchange, 200, "{\"success\":true,\"deletedId\":" + id + "}");
                    } else {
                        sendError(exchange, 400, "Missing id parameter");
                    }
                } else {
                    sendError(exchange, 405, "Method Not Allowed");
                }
            } catch (Exception e) {
                sendError(exchange, 500, e.getMessage());
            }
        }
    }

    private class StockInHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (isPreflight(exchange)) return;
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendError(exchange, 405, "Method Not Allowed");
                return;
            }

            try {
                String body = readRequestBody(exchange);
                Map<String, String> map = JsonUtil.parseSimpleJson(body);
                int productId = Integer.parseInt(map.get("productId"));
                int quantity = Integer.parseInt(map.get("quantity"));
                String reason = map.getOrDefault("reason", "Stock Inward Receipt");

                inventoryService.recordStockIn(productId, quantity, reason);
                sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Stock added successfully\"}");
            } catch (Exception e) {
                sendError(exchange, 400, e.getMessage());
            }
        }
    }

    private class StockOutHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (isPreflight(exchange)) return;
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendError(exchange, 405, "Method Not Allowed");
                return;
            }

            try {
                String body = readRequestBody(exchange);
                Map<String, String> map = JsonUtil.parseSimpleJson(body);
                int productId = Integer.parseInt(map.get("productId"));
                int quantity = Integer.parseInt(map.get("quantity"));
                String reason = map.getOrDefault("reason", "Manual write-off / return");

                inventoryService.recordStockOut(productId, quantity, reason);
                sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Stock deducted successfully\"}");
            } catch (InsufficientStockException e) {
                sendError(exchange, 400, e.getMessage());
            } catch (Exception e) {
                sendError(exchange, 500, e.getMessage());
            }
        }
    }

    private class StockMovementsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (isPreflight(exchange)) return;
            try {
                List<StockMovement> list = movementDAO.getRecentMovements(50);
                sendJsonResponse(exchange, 200, JsonUtil.toJson(list));
            } catch (Exception e) {
                sendError(exchange, 500, e.getMessage());
            }
        }
    }

    private class SalesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (isPreflight(exchange)) return;
            try {
                if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                    List<Sale> list = salesDAO.getRecentSales(30);
                    sendJsonResponse(exchange, 200, JsonUtil.toJson(list));
                } else if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                    String body = readRequestBody(exchange);
                    Map<String, String> map = JsonUtil.parseSimpleJson(body);

                    int productId = Integer.parseInt(map.get("productId"));
                    int quantity = Integer.parseInt(map.get("quantity"));
                    double unitPrice = Double.parseDouble(map.get("unitPrice"));
                    String customer = map.getOrDefault("customerName", "Walk-in Customer");
                    String payment = map.getOrDefault("paymentMode", "Cash");

                    Sale sale = new Sale();
                    sale.setInvoiceNo("INV-" + System.currentTimeMillis() % 1000000);
                    sale.setCustomerName(customer);
                    sale.setPaymentMode(payment);
                    sale.setTotalAmount(quantity * unitPrice);

                    SaleItem item = new SaleItem(productId, quantity, unitPrice);
                    sale.addItem(item);

                    salesDAO.processSaleTransaction(sale);
                    sendJsonResponse(exchange, 201, "{\"success\":true,\"invoiceNo\":\"" + sale.getInvoiceNo() + "\"}");
                } else {
                    sendError(exchange, 405, "Method Not Allowed");
                }
            } catch (InsufficientStockException e) {
                sendError(exchange, 400, e.getMessage());
            } catch (Exception e) {
                sendError(exchange, 500, e.getMessage());
            }
        }
    }

    private class PredictionHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (isPreflight(exchange)) return;
            try {
                List<RestockRecommendation> recs = predictorService.generateRestockRecommendations();
                sendJsonResponse(exchange, 200, JsonUtil.toJson(recs));
            } catch (Exception e) {
                sendError(exchange, 500, e.getMessage());
            }
        }
    }

    private class DashboardMetricsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (isPreflight(exchange)) return;
            try {
                Map<String, Object> metrics = inventoryService.getDashboardMetrics();
                sendJsonResponse(exchange, 200, JsonUtil.toJson(metrics));
            } catch (Exception e) {
                sendError(exchange, 500, e.getMessage());
            }
        }
    }
}
