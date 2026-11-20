package com.inventory.model;

import java.sql.Timestamp;

/**
 * StockMovement Model
 * Represents Stock In, Stock Out, or Inventory Adjustments
 */
public class StockMovement {
    private int movementId;
    private int productId;
    private String productName;
    private String sku;
    private String movementType; // "IN", "OUT", "ADJUSTMENT"
    private int quantity;
    private String reason;
    private Timestamp movementDate;

    public StockMovement() {}

    public StockMovement(int productId, String movementType, int quantity, String reason) {
        this.productId = productId;
        this.movementType = movementType;
        this.quantity = quantity;
        this.reason = reason;
    }

    public int getMovementId() { return movementId; }
    public void setMovementId(int movementId) { this.movementId = movementId; }

    public int getProductId() { return productId; }
    public void setProductId(int productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getMovementType() { return movementType; }
    public void setMovementType(String movementType) { this.movementType = movementType; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Timestamp getMovementDate() { return movementDate; }
    public void setMovementDate(Timestamp movementDate) { this.movementDate = movementDate; }
}
