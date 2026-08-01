package com.marketplace.backend.config;

import com.marketplace.backend.model.PlatformSettings;
import com.marketplace.backend.model.Product;
import com.marketplace.backend.model.User;
import com.marketplace.backend.repository.PlatformSettingsRepository;
import com.marketplace.backend.repository.ProductRepository;
import com.marketplace.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "admin@prepplushub.com";
    private static final String PASSWORD_CHARS =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    private final SecureRandom random = new SecureRandom();

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PlatformSettingsRepository platformSettingsRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    // No insecure default — if unset, a random password is generated at boot
    // and logged once, the same way Spring Security prints its own generated
    // password. Set this explicitly in production so the admin password is
    // stable across restarts instead of only ever known from a boot log.
    @Value("${app.admin-seed.password:}")
    private String configuredAdminPassword;

    public DataSeeder(
            ProductRepository productRepository,
            UserRepository userRepository,
            PlatformSettingsRepository platformSettingsRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.platformSettingsRepository = platformSettingsRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!seedEnabled) {
            return;
        }
        seedAdmin();
        seedSettings();
        seedProducts();
    }

    private void seedAdmin() {
        if (userRepository.findByEmail(ADMIN_EMAIL).isPresent()) {
            return;
        }
        String password = configuredAdminPassword.isBlank()
                ? generatePassword()
                : configuredAdminPassword;

        User admin = new User();
        admin.setName("PrepplusHub Admin");
        admin.setEmail(ADMIN_EMAIL);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRole("admin");
        admin.setOnboardingStage("active");
        admin.setEmailVerified(true);
        admin.setPhone("+2348000000000");
        admin.setCreatedAt(Instant.now());
        admin.setUpdatedAt(Instant.now());
        userRepository.save(admin);

        if (configuredAdminPassword.isBlank()) {
            System.out.println("[PrepplusHub Seed] Generated admin password (save this — it will "
                    + "not be shown again): " + ADMIN_EMAIL + " / " + password);
        } else {
            System.out.println("[PrepplusHub Seed] Admin account created: " + ADMIN_EMAIL);
        }
    }

    private String generatePassword() {
        StringBuilder sb = new StringBuilder(16);
        for (int i = 0; i < 16; i++) {
            sb.append(PASSWORD_CHARS.charAt(random.nextInt(PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }

    private void seedSettings() {
        if (platformSettingsRepository.existsById(PlatformSettings.SINGLETON_ID)) {
            return;
        }
        PlatformSettings s = new PlatformSettings();
        s.setFeaturedCategories(List.of("Electronics", "Fashion", "Home"));
        PlatformSettings.Banner b = new PlatformSettings.Banner();
        b.setId("b-1");
        b.setTitle("Mid-year sale");
        b.setActive(true);
        s.setBanners(List.of(b));
        platformSettingsRepository.save(s);
    }

    private void seedProducts() {
        if (productRepository.count() > 0) {
            return;
        }

        productRepository.save(product("p-1", "Woven Raffia Tote", "Lagos Leather Co.", "v-1001",
                24500, null, "Fashion", 4.6, 38,
                "Hand-woven raffia tote with a leather-trimmed strap. Made in small batches.", null));
        productRepository.save(product("p-2", "Noise-Isolating Earbuds", "Everstock Electronics", "v-1002",
                38900, 54900.0, "Electronics", 4.3, 112,
                "30-hour battery life, USB-C fast charge, IPX5 water resistance.", null));
        productRepository.save(product("p-3", "Ceramic Pour-Over Set", "Kiln & Co.", "v-1003",
                15900, null, "Home", 4.8, 61,
                "Hand-thrown ceramic dripper and matching carafe, 500ml capacity.", "sample"));
        productRepository.save(product("p-4", "Shea & Oat Body Cream", "Bare Botanicals", "v-1004",
                8500, 12000.0, "Beauty", 4.7, 204,
                "Whipped shea butter with colloidal oat, fragrance-free, for sensitive skin.", null));
        productRepository.save(product("p-5", "Everyday Canvas Sneakers", "Field & Form", "v-1005",
                21000, 28000.0, "Fashion", 4.4, 87,
                "Low-top canvas sneakers with a recycled-rubber sole. True to size.", "ai/model_plain_sweatshirt"));
        productRepository.save(product("p-6", "Mechanical Keyboard (65%)", "Everstock Electronics", "v-1002",
                54000, null, "Electronics", 4.5, 76,
                "Hot-swappable switches, PBT keycaps, USB-C detachable cable.", null));
        productRepository.save(product("p-7", "Linen Table Runner", "Kiln & Co.", "v-1003",
                9200, null, "Home", 4.9, 29,
                "Stonewashed linen, 180cm, machine washable.", null));
        productRepository.save(product("p-8", "Trail-Ready Backpack 22L", "Field & Form", "v-1005",
                32500, 41000.0, "Sports", 4.5, 54,
                "Weatherproof shell, padded laptop sleeve, side water-bottle pockets.", null));
        productRepository.save(product("p-9", "Classic Pullover Hoodie - Sand", "Field & Form", "v-1005",
                19500, null, "Fashion", 4.7, 44,
                "Heavyweight fleece pullover with a kangaroo pocket and drawstring hood.", null));
        productRepository.save(product("p-10", "Classic Pullover Hoodie - Burgundy", "Field & Form", "v-1005",
                19500, 24000.0, "Fashion", 4.8, 61,
                "Heavyweight fleece pullover with a kangaroo pocket and drawstring hood.", null));
        productRepository.save(product("p-11", "Classic Pullover Hoodie - White", "Field & Form", "v-1005",
                19500, null, "Fashion", 4.6, 29,
                "Heavyweight fleece pullover with a kangaroo pocket and drawstring hood.", null));
        productRepository.save(product("p-12", "Classic Pullover Hoodie - Sky Blue", "Field & Form", "v-1005",
                19500, null, "Fashion", 4.7, 33,
                "Heavyweight fleece pullover with a kangaroo pocket and drawstring hood.", null));

        System.out.println("[PrepplusHub Seed] Seeded 12 catalog products");
    }

    private Product product(
            String id, String name, String vendor, String vendorId,
            double price, Double originalPrice, String category,
            double rating, int reviewCount, String description, String image
    ) {
        Product p = new Product();
        p.setId(id);
        p.setName(name);
        p.setVendor(vendor);
        p.setVendorId(vendorId);
        p.setPrice(price);
        p.setOriginalPrice(originalPrice);
        p.setCategory(category);
        p.setRating(rating);
        p.setReviewCount(reviewCount);
        p.setDescription(description);
        p.setImage(image);
        p.setActive(true);
        p.setCreatedAt(Instant.now());
        return p;
    }
}
