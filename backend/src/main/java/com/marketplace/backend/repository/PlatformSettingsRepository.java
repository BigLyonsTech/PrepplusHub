package com.marketplace.backend.repository;

import com.marketplace.backend.model.PlatformSettings;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PlatformSettingsRepository extends MongoRepository<PlatformSettings, String> {
}
