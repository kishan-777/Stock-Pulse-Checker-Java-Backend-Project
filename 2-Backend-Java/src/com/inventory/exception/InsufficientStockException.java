package com.inventory.exception;

/**
 * Thrown when an order or stock-out attempts to deduct more stock than available.
 * Demonstrates Java Exception Handling (Custom Checked/Unchecked Exceptions).
 */
public class InsufficientStockException extends Exception {
    private final int productId;
    private final int requested;
    private final int available;

    public InsufficientStockException(int productId, int requested, int available) {
        super(String.format("Insufficient stock for Product ID %d: Requested %d, Available %d", productId, requested, available));
        this.productId = productId;
        this.requested = requested;
        this.available = available;
    }

    public int getProductId() { return productId; }
    public int getRequested() { return requested; }
    public int getAvailable() { return available; }
}
