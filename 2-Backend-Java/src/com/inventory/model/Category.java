package com.inventory.model;

import java.sql.Timestamp;

/**
 * Category Model
 * Demonstrates OOP: Encapsulation (private members with getters/setters)
 */
public class Category {
    private int categoryId;
    private String name;
    private String description;
    private Timestamp createdAt;

    public Category() {}

    public Category(int categoryId, String name, String description) {
        this.categoryId = categoryId;
        this.name = name;
        this.description = description;
    }

    public int getCategoryId() { return categoryId; }
    public void setCategoryId(int categoryId) { this.categoryId = categoryId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
