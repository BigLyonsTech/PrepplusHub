package com.marketplace.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/** Enables @Async so notification emails don't block the request that triggered them. */
@Configuration
@EnableAsync
public class AsyncConfig {
}
