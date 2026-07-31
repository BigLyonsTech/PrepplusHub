package com.marketplace.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "platform_settings")
public class PlatformSettings {

    public static final String SINGLETON_ID = "default";

    @Id
    private String id = SINGLETON_ID;
    private List<String> featuredCategories = new ArrayList<>();
    private List<Banner> banners = new ArrayList<>();

    public static class Banner {
        private String id;
        private String title;
        private boolean active;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public List<String> getFeaturedCategories() { return featuredCategories; }
    public void setFeaturedCategories(List<String> featuredCategories) { this.featuredCategories = featuredCategories; }
    public List<Banner> getBanners() { return banners; }
    public void setBanners(List<Banner> banners) { this.banners = banners; }
}
