package com.inventory.model;

import java.sql.Timestamp;

/**
 * Product Model
 * Demonstrates OOP: Encapsulation & Domain Modeling
 */
public class Product {
    private int productId;
    private String sku;
    private String name;
    private Integer categoryId;
    private String categoryName; // Helper for UI display
    private double unitPrice;
    private double costPrice;
    private int currentStock;
    private int leadTimeDays;
    private int safetyStock;
    private int targetStockDays;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public Product() {}

    public Product(int productId, String sku, String name, Integer categoryId, double unitPrice, 
                   double costPrice, int currentStock, int leadTimeDays, int safetyStock, int targetStockDays) {
        this.productId = productId;
        this.sku = sku;
        this.name = name;
        this.categoryId = categoryId;
        this.unitPrice = unitPrice;
        this.costPrice = costPrice;
        this.currentStock = currentStock;
        this.leadTimeDays = leadTimeDays;
        this.safetyStock = safetyStock;
        this.targetStockDays = targetStockDays;
    }

    public int getProductId() { return productId; }
    public void setProductId(int productId) { this.productId = productId; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(double unitPrice) { this.unitPrice = unitPrice; }

    public double getCostPrice() { return costPrice; }
    public void setCostPrice(double costPrice) { this.costPrice = costPrice; }

    public int getCurrentStock() { return currentStock; }
    public void setCurrentStock(int currentStock) { this.currentStock = currentStock; }

    public int getLeadTimeDays() { return leadTimeDays; }
    public void setLeadTimeDays(int leadTimeDays) { this.leadTimeDays = leadTimeDays; }

    public int getSafetyStock() { return safetyStock; }
    public void setSafetyStock(int safetyStock) { this.safetyStock = safetyStock; }

    public int getTargetStockDays() { return targetStockDays; }
    public void setTargetStockDays(int targetStockDays) { this.targetStockDays = targetStockDays; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
}
