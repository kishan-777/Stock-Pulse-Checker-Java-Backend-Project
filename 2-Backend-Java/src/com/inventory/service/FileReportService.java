package com.inventory.service;

import com.inventory.dao.ProductDAO;
import com.inventory.model.Product;

import java.io.*;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * FileReportService
 * 
 * Demonstrates Java File Handling & Collections Integration:
 * 1. Character Streams (FileReader, FileWriter, BufferedReader, BufferedWriter)
 * 2. Byte Streams (FileOutputStream, FileInputStream)
 * 3. Exception-safe resource handling using try-with-resources
 * 4. CSV Import & Export with data validation
 */
public class FileReportService {
    private final ProductDAO productDAO = new ProductDAO();

    /**
     * Export all products to a CSV file using Character Streams (BufferedWriter & FileWriter).
     */
    public int exportProductsToCsv(File targetFile) throws IOException, SQLException {
        List<Product> products = productDAO.getAllProducts();

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(targetFile))) {
            // Write CSV Header
            writer.write("ProductID,SKU,Name,Category,UnitPrice,CostPrice,CurrentStock,LeadTimeDays,SafetyStock,TargetStockDays");
            writer.newLine();

            // Write each product record
            for (Product p : products) {
                String line = String.format("%d,\"%s\",\"%s\",\"%s\",%.2f,%.2f,%d,%d,%d,%d",
                        p.getProductId(),
                        p.getSku() != null ? p.getSku().replace("\"", "\"\"") : "",
                        p.getName() != null ? p.getName().replace("\"", "\"\"") : "",
                        p.getCategoryName() != null ? p.getCategoryName().replace("\"", "\"\"") : "General",
                        p.getUnitPrice(),
                        p.getCostPrice(),
                        p.getCurrentStock(),
                        p.getLeadTimeDays(),
                        p.getSafetyStock(),
                        p.getTargetStockDays());
                writer.write(line);
                writer.newLine();
            }
        }
        return products.size();
    }

    /**
     * Import products from a CSV file using Character Streams (BufferedReader & FileReader).
     * Performs input validation, data parsing, and collection management.
     */
    public List<Product> importProductsFromCsv(File sourceFile) throws IOException {
        List<Product> importedProducts = new ArrayList<>();

        if (!sourceFile.exists()) {
            throw new FileNotFoundException("CSV file not found: " + sourceFile.getAbsolutePath());
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(sourceFile))) {
            String line = reader.readLine(); // Read and skip header line
            int lineNum = 1;

            while ((line = reader.readLine()) != null) {
                lineNum++;
                line = line.trim();
                if (line.isEmpty()) continue;

                String[] tokens = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
                if (tokens.length < 10) {
                    System.err.println("[CSV Warning] Skipping malformed line " + lineNum + ": " + line);
                    continue;
                }

                try {
                    int id = Integer.parseInt(tokens[0].trim());
                    String sku = tokens[1].replace("\"", "").trim();
                    String name = tokens[2].replace("\"", "").trim();
                    String category = tokens[3].replace("\"", "").trim();
                    double unitPrice = Double.parseDouble(tokens[4].trim());
                    double costPrice = Double.parseDouble(tokens[5].trim());
                    int stock = Integer.parseInt(tokens[6].trim());
                    int leadTime = Integer.parseInt(tokens[7].trim());
                    int safetyStock = Integer.parseInt(tokens[8].trim());
                    int targetDays = Integer.parseInt(tokens[9].trim());

                    Product p = new Product(id, sku, name, null, unitPrice, costPrice, stock, leadTime, safetyStock, targetDays);
                    p.setCategoryName(category);
                    importedProducts.add(p);
                } catch (NumberFormatException nfe) {
                    System.err.println("[CSV Error] Number parsing failed on line " + lineNum + ": " + nfe.getMessage());
                }
            }
        }
        return importedProducts;
    }

    /**
     * Export raw binary audit log using Byte Streams (FileOutputStream).
     */
    public void exportBinaryAuditSnapshot(File targetFile, String auditLogData) throws IOException {
        try (FileOutputStream fos = new FileOutputStream(targetFile)) {
            byte[] bytes = auditLogData.getBytes();
            fos.write(bytes);
            fos.flush();
        }
    }
}
