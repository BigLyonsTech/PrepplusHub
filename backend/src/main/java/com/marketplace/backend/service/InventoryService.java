package com.marketplace.backend.service;

import com.marketplace.backend.exception.ApiException;
import com.marketplace.backend.model.Order;
import com.marketplace.backend.model.Product;
import com.marketplace.backend.repository.ProductRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Stock bookkeeping. A product with a null stock is untracked and always
 * purchasable; a numeric stock is only ever changed through conditional
 * atomic updates here, so two buyers racing for the last unit can't both win.
 */
@Service
public class InventoryService {

    public static final int LOW_STOCK_THRESHOLD = 5;

    private final MongoTemplate mongoTemplate;
    private final ProductRepository productRepository;

    public InventoryService(MongoTemplate mongoTemplate, ProductRepository productRepository) {
        this.mongoTemplate = mongoTemplate;
        this.productRepository = productRepository;
    }

    /** Throws 409 if the product can't currently be bought in this quantity. Doesn't reserve anything. */
    public void assertAvailable(Product product, int quantity) {
        if (!product.isActive()) {
            throw new ApiException(product.getName() + " is no longer available", HttpStatus.CONFLICT);
        }
        Integer stock = product.getStock();
        if (stock == null) return;
        if (stock <= 0) {
            throw new ApiException(product.getName() + " is out of stock", HttpStatus.CONFLICT);
        }
        if (quantity > stock) {
            throw new ApiException("Only " + stock + " left of " + product.getName(), HttpStatus.CONFLICT);
        }
    }

    /**
     * Takes every line's quantity out of tracked stock, all-or-nothing. Returns
     * the name of the first product that couldn't be covered (after putting
     * back anything already taken), or empty if every line was reserved.
     */
    public Optional<String> reserve(List<Order.OrderLine> lines) {
        List<Order.OrderLine> taken = new ArrayList<>();
        for (Order.OrderLine line : lines) {
            Query query = new Query(Criteria.where("_id").is(line.getProductId())
                    .and("stock").gte(line.getQuantity()));
            long modified = mongoTemplate
                    .updateFirst(query, new Update().inc("stock", -line.getQuantity()), Product.class)
                    .getModifiedCount();
            if (modified == 1) {
                line.setStockReserved(true);
                taken.add(line);
                continue;
            }
            boolean untracked = productRepository.findById(line.getProductId())
                    .map(p -> p.getStock() == null)
                    .orElse(false);
            if (!untracked) {
                release(taken);
                return Optional.of(line.getProductName());
            }
        }
        return Optional.empty();
    }

    /** Puts reserved quantities back (order cancelled, or saving it failed). */
    public void release(List<Order.OrderLine> lines) {
        for (Order.OrderLine line : lines) {
            if (!line.isStockReserved()) continue;
            Query query = new Query(Criteria.where("_id").is(line.getProductId()).and("stock").ne(null));
            mongoTemplate.updateFirst(query, new Update().inc("stock", line.getQuantity()), Product.class);
            line.setStockReserved(false);
        }
    }

    public List<Product> lowStock() {
        return productRepository.findByActiveTrueAndStockLessThanEqual(LOW_STOCK_THRESHOLD);
    }
}
