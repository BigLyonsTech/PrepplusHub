package com.marketplace.backend.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;

/**
 * Spring Boot 4.1 / spring-data-mongodb 5.1 in this project isn't honoring
 * spring.data.mongodb.uri's path segment or spring.data.mongodb.database when
 * wiring the default MongoDatabaseFactory (writes silently land in Mongo's
 * "test" database instead). Building the factory explicitly sidesteps it.
 */
@Configuration
public class MongoConfig {

    @Bean
    public MongoDatabaseFactory mongoDatabaseFactory(
            @Value("${spring.data.mongodb.uri}") String uri,
            @Value("${spring.data.mongodb.database}") String database
    ) {
        MongoClientSettings settings = MongoClientSettings.builder()
                .applyConnectionString(new ConnectionString(uri))
                .build();
        MongoClient client = MongoClients.create(settings);
        return new SimpleMongoClientDatabaseFactory(client, database);
    }
}
