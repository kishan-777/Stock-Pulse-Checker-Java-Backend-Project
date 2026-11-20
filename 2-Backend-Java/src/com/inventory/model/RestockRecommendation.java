package com.inventory.model;

/**
 * RestockRecommendation Model
 * Output of the DemandPredictor algorithm
 */
public class RestockRecommendation {
    private int productId;
    private String sku;
    private String productName;
    private String categoryName;
    private int currentStock;
    private double averageDailySales;
    private int leadTimeDays;
    private int safetyStock;
    private int reorderPoint;
    private int targetStockDays;
    private int suggestedRestockQuantity;
    private double daysOfSupplyRemaining;
    private String urgencyStatus; // "CRITICAL", "WARNING", "OPTIMAL"
    private String explanation;

    public RestockRecommendation() {}

    public int getProductId() { return productId; }
    public void setProductId(int productId) { this.productId = productId; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public int getCurrentStock() { return currentStock; }
    public void setCurrentStock(int currentStock) { this.currentStock = currentStock; }

    public double getAverageDailySales() { return averageDailySales; }
    public void setAverageDailySales(double averageDailySales) { this.averageDailySales = averageDailySales; }

    public int getLeadTimeDays() { return leadTimeDays; }
    public void setLeadTimeDays(int leadTimeDays) { this.leadTimeDays = leadTimeDays; }

    public int getSafetyStock() { return safetyStock; }
    public void setSafetyStock(int safetyStock) { this.safetyStock = safetyStock; }

    public int getReorderPoint() { return reorderPoint; }
    public void setReorderPoint(int reorderPoint) { this.reorderPoint = reorderPoint; }

    public int getTargetStockDays() { return targetStockDays; }
    public void setTargetStockDays(int targetStockDays) { this.targetStockDays = targetStockDays; }

    public int getSuggestedRestockQuantity() { return suggestedRestockQuantity; }
    public void setSuggestedRestockQuantity(int suggestedRestockQuantity) { this.suggestedRestockQuantity = suggestedRestockQuantity; }

    public double getDaysOfSupplyRemaining() { return daysOfSupplyRemaining; }
    public void setDaysOfSupplyRemaining(double daysOfSupplyRemaining) { this.daysOfSupplyRemaining = daysOfSupplyRemaining; }

    public String getUrgencyStatus() { return urgencyStatus; }
    public void setUrgencyStatus(String urgencyStatus) { this.urgencyStatus = urgencyStatus; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
