package com.marketplace.backend.dto;

import java.util.List;

public class PersonalizationRequest {
    private List<String> interests;
    private String budgetRange;
    private String shoppingStyle;

    public List<String> getInterests() { return interests; }
    public void setInterests(List<String> interests) { this.interests = interests; }
    public String getBudgetRange() { return budgetRange; }
    public void setBudgetRange(String budgetRange) { this.budgetRange = budgetRange; }
    public String getShoppingStyle() { return shoppingStyle; }
    public void setShoppingStyle(String shoppingStyle) { this.shoppingStyle = shoppingStyle; }
}
