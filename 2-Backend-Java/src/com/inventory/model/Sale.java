package com.inventory.model;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

/**
 * Sale Model (Order Header)
 */
public class Sale {
    private int saleId;
    private String invoiceNo;
    private Timestamp saleDate;
    private double totalAmount;
    private String customerName;
    private String paymentMode;
    private List<SaleItem> items = new ArrayList<>();

    public Sale() {}

    public Sale(String invoiceNo, double totalAmount, String customerName, String paymentMode) {
        this.invoiceNo = invoiceNo;
        this.totalAmount = totalAmount;
        this.customerName = customerName;
        this.paymentMode = paymentMode;
    }

    public int getSaleId() { return saleId; }
    public void setSaleId(int saleId) { this.saleId = saleId; }

    public String getInvoiceNo() { return invoiceNo; }
    public void setInvoiceNo(String invoiceNo) { this.invoiceNo = invoiceNo; }

    public Timestamp getSaleDate() { return saleDate; }
    public void setSaleDate(Timestamp saleDate) { this.saleDate = saleDate; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }

    public List<SaleItem> getItems() { return items; }
    public void setItems(List<SaleItem> items) { this.items = items; }
    public void addItem(SaleItem item) { this.items.add(item); }
}
