package com.inventory.controller;

import com.inventory.model.*;

import java.util.*;

/**
 * Lightweight JSON Utility
 * Serializes Java domain models into clean JSON strings and parses incoming JSON maps.
 * Ensures the project runs standalone on ANY machine with 0 dependency conflicts!
 */
public class JsonUtil {

    public static String toJson(Object obj) {
        if (obj == null) return "null";

        if (obj instanceof String) {
            return "\"" + escape((String) obj) + "\"";
        } else if (obj instanceof Number || obj instanceof Boolean) {
            return obj.toString();
        } else if (obj instanceof List<?>) {
            List<?> list = (List<?>) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < list.size(); i++) {
                sb.append(toJson(list.get(i)));
                if (i < list.size() - 1) sb.append(",");
            }
            sb.append("]");
            return sb.toString();
        } else if (obj instanceof Map<?, ?>) {
            Map<?, ?> map = (Map<?, ?>) obj;
            StringBuilder sb = new StringBuilder("{");
            int i = 0;
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                sb.append("\"").append(escape(entry.getKey().toString())).append("\":");
                sb.append(toJson(entry.getValue()));
                if (++i < map.size()) sb.append(",");
            }
            sb.append("}");
            return sb.toString();
        } else if (obj instanceof Category) {
            Category c = (Category) obj;
            return String.format("{\"categoryId\":%d,\"name\":\"%s\",\"description\":\"%s\"}",
                c.getCategoryId(), escape(c.getName()), escape(c.getDescription()));
        } else if (obj instanceof Product) {
            Product p = (Product) obj;
            return String.format(Locale.US,
                "{\"productId\":%d,\"sku\":\"%s\",\"name\":\"%s\",\"categoryId\":%s,\"categoryName\":\"%s\"," +
                "\"unitPrice\":%.2f,\"costPrice\":%.2f,\"currentStock\":%d,\"leadTimeDays\":%d,\"safetyStock\":%d,\"targetStockDays\":%d}",
                p.getProductId(), escape(p.getSku()), escape(p.getName()),
                p.getCategoryId() != null ? p.getCategoryId() : "null",
                p.getCategoryName() != null ? escape(p.getCategoryName()) : "",
                p.getUnitPrice(), p.getCostPrice(), p.getCurrentStock(),
                p.getLeadTimeDays(), p.getSafetyStock(), p.getTargetStockDays());
        } else if (obj instanceof StockMovement) {
            StockMovement sm = (StockMovement) obj;
            return String.format("{\"movementId\":%d,\"productId\":%d,\"sku\":\"%s\",\"productName\":\"%s\"," +
                "\"movementType\":\"%s\",\"quantity\":%d,\"reason\":\"%s\",\"movementDate\":\"%s\"}",
                sm.getMovementId(), sm.getProductId(), escape(sm.getSku()), escape(sm.getProductName()),
                sm.getMovementType(), sm.getQuantity(), escape(sm.getReason()),
                sm.getMovementDate() != null ? sm.getMovementDate().toString() : "");
        } else if (obj instanceof Sale) {
            Sale s = (Sale) obj;
            return String.format(Locale.US,
                "{\"saleId\":%d,\"invoiceNo\":\"%s\",\"saleDate\":\"%s\",\"totalAmount\":%.2f,\"customerName\":\"%s\",\"paymentMode\":\"%s\"}",
                s.getSaleId(), escape(s.getInvoiceNo()),
                s.getSaleDate() != null ? s.getSaleDate().toString() : "",
                s.getTotalAmount(), escape(s.getCustomerName()), escape(s.getPaymentMode()));
        } else if (obj instanceof RestockRecommendation) {
            RestockRecommendation r = (RestockRecommendation) obj;
            return String.format(Locale.US,
                "{\"productId\":%d,\"sku\":\"%s\",\"productName\":\"%s\",\"categoryName\":\"%s\"," +
                "\"currentStock\":%d,\"averageDailySales\":%.2f,\"leadTimeDays\":%d,\"safetyStock\":%d," +
                "\"reorderPoint\":%d,\"targetStockDays\":%d,\"suggestedRestockQuantity\":%d," +
                "\"daysOfSupplyRemaining\":%.1f,\"urgencyStatus\":\"%s\",\"explanation\":\"%s\"}",
                r.getProductId(), escape(r.getSku()), escape(r.getProductName()), escape(r.getCategoryName()),
                r.getCurrentStock(), r.getAverageDailySales(), r.getLeadTimeDays(), r.getSafetyStock(),
                r.getReorderPoint(), r.getTargetStockDays(), r.getSuggestedRestockQuantity(),
                r.getDaysOfSupplyRemaining(), r.getUrgencyStatus(), escape(r.getExplanation()));
        }

        return "\"" + escape(obj.toString()) + "\"";
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    /**
     * Minimal key-value JSON object parser for incoming requests
     */
    public static Map<String, String> parseSimpleJson(String json) {
        Map<String, String> map = new HashMap<>();
        if (json == null || json.trim().isEmpty()) return map;

        String content = json.trim();
        if (content.startsWith("{")) content = content.substring(1);
        if (content.endsWith("}")) content = content.substring(0, content.length() - 1);

        String[] pairs = content.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
        for (String pair : pairs) {
            String[] kv = pair.split(":(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", 2);
            if (kv.length == 2) {
                String key = cleanToken(kv[0]);
                String val = cleanToken(kv[1]);
                map.put(key, val);
            }
        }
        return map;
    }

    private static String cleanToken(String t) {
        String s = t.trim();
        if (s.startsWith("\"") && s.endsWith("\"") && s.length() >= 2) {
            s = s.substring(1, s.length() - 1);
        }
        return s;
    }
}
