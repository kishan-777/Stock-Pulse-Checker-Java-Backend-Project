package com.inventory.service;

import com.inventory.dao.ProductDAO;
import com.inventory.dao.SalesDAO;
import com.inventory.model.Product;
import com.inventory.model.RestockRecommendation;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

/**
 * DemandPredictorService
 * 
 * Implements the core predictive replenishment algorithms:
 * 1. Historical Sales Velocity (Moving Average over 30 days)
 * 2. Reorder Point: ROP = (Average Daily Sales * Lead Time in Days) + Safety Stock
 * 3. Restock Recommendation: Suggested = (Target Stock Days * Average Daily Sales) - Current Stock
 * 4. Days of Supply remaining and Urgency classification
 */
public class DemandPredictorService {
    private final ProductDAO productDAO = new ProductDAO();
    private final SalesDAO salesDAO = new SalesDAO();

    // Default historical window in days
    private static final int ANALYSIS_WINDOW_DAYS = 30;

    public List<RestockRecommendation> generateRestockRecommendations() throws SQLException {
        List<Product> products = productDAO.getAllProducts();
        Map<Integer, Integer> unitsSoldMap = salesDAO.getUnitsSoldInLastDays(ANALYSIS_WINDOW_DAYS);

        List<RestockRecommendation> recommendations = new ArrayList<>();

        for (Product p : products) {
            RestockRecommendation rec = new RestockRecommendation();
            rec.setProductId(p.getProductId());
            rec.setSku(p.getSku());
            rec.setProductName(p.getName());
            rec.setCategoryName(p.getCategoryName() != null ? p.getCategoryName() : "Uncategorized");
            rec.setCurrentStock(p.getCurrentStock());
            rec.setLeadTimeDays(p.getLeadTimeDays());
            rec.setSafetyStock(p.getSafetyStock());
            rec.setTargetStockDays(p.getTargetStockDays());

            // 1. Calculate Average Daily Sales (ADS) over the analysis period
            int totalSold = unitsSoldMap.getOrDefault(p.getProductId(), 0);
            double ads = (double) totalSold / ANALYSIS_WINDOW_DAYS;
            
            // Round ADS to 2 decimal places
            ads = Math.round(ads * 100.0) / 100.0;
            // Minimum baseline of 0.1 to avoid division by zero
            double effectiveAds = ads > 0.05 ? ads : 0.10;
            rec.setAverageDailySales(ads);

            // 2. Calculate Reorder Point (ROP)
            // ROP = (Average Daily Sales * Lead Time) + Safety Stock
            int rop = (int) Math.ceil((effectiveAds * p.getLeadTimeDays()) + p.getSafetyStock());
            rec.setReorderPoint(rop);

            // 3. Days of supply remaining
            double daysRemaining = p.getCurrentStock() / effectiveAds;
            rec.setDaysOfSupplyRemaining(Math.round(daysRemaining * 10.0) / 10.0);

            // 4. Calculate Suggested Restock Quantity
            // Suggested = (Target Stock Days * ADS) - Current Stock
            int targetInventory = (int) Math.ceil(p.getTargetStockDays() * effectiveAds);
            int suggestedQty = Math.max(0, targetInventory - p.getCurrentStock());
            rec.setSuggestedRestockQuantity(suggestedQty);

            // 5. Determine Urgency Level & Explanation
            if (p.getCurrentStock() <= p.getSafetyStock() || daysRemaining <= 2.5) {
                rec.setUrgencyStatus("CRITICAL");
                rec.setExplanation(String.format(
                    "CRITICAL STOCK OUT ALERT! Stock (%d) is at or below safety buffer (%d). Days of supply: %.1f days. Reorder %d units immediately.",
                    p.getCurrentStock(), p.getSafetyStock(), daysRemaining, suggestedQty
                ));
            } else if (p.getCurrentStock() <= rop) {
                rec.setUrgencyStatus("WARNING");
                rec.setExplanation(String.format(
                    "Reorder point reached. Current stock (%d) <= ROP (%d). Estimated %d days lead time. Suggested restock: %d units.",
                    p.getCurrentStock(), rop, p.getLeadTimeDays(), suggestedQty
                ));
            } else {
                rec.setUrgencyStatus("OPTIMAL");
                rec.setExplanation(String.format(
                    "Stock levels healthy. Stock of %d exceeds reorder point (%d) with %.1f days of coverage.",
                    p.getCurrentStock(), rop, daysRemaining
                ));
            }

            recommendations.add(rec);
        }

        // Sort by urgency: CRITICAL first, then WARNING, then OPTIMAL
        recommendations.sort(Comparator.comparingInt(r -> {
            switch (r.getUrgencyStatus()) {
                case "CRITICAL": return 1;
                case "WARNING":  return 2;
                default:         return 3;
            }
        }));

        return recommendations;
    }
}
