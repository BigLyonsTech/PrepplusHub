package com.marketplace.backend.service;

import com.marketplace.backend.model.ActivityLog;
import com.marketplace.backend.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class ActivityService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    public void log(String userId, String action) {
        log(userId, action, Map.of());
    }

    public void log(String userId, String action, Map<String, Object> metadata) {
        ActivityLog entry = new ActivityLog(userId, action);
        if (metadata != null) {
            entry.setMetadata(metadata);
        }
        activityLogRepository.save(entry);
    }
}
