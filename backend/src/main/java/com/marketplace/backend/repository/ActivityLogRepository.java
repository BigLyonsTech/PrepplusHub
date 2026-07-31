package com.marketplace.backend.repository;

import com.marketplace.backend.model.ActivityLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ActivityLogRepository extends MongoRepository<ActivityLog, String> {
    List<ActivityLog> findTop100ByOrderByCreatedAtDesc();
}
