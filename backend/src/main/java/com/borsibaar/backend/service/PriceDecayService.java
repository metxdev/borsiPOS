package com.borsibaar.backend.service;

import com.borsibaar.backend.entity.PriceHistory;
import com.borsibaar.backend.entity.Product;
import com.borsibaar.backend.repository.PriceHistoryRepository;
import com.borsibaar.backend.repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class PriceDecayService {

    private final ProductRepository productRepo;
    private final PriceHistoryRepository priceHistoryRepo;

    private static final Map<String, BigDecimal> DECAY_STEP = Map.of(
            "cocktails", new BigDecimal("0.05"),
            "shots",     new BigDecimal("0.05")
    );

    // Don’t start decaying immediately after a sale
    private static final long GRACE_MINUTES = 2; // wait N minutes after last sale

    public PriceDecayService(ProductRepository productRepo, PriceHistoryRepository priceHistoryRepo) {
        this.productRepo = productRepo;
        this.priceHistoryRepo = priceHistoryRepo;
    }

    // Every minute
    @Scheduled(fixedRate = 60_000L)
    @Transactional
    public void decayPrices() {
        List<Product> products = productRepo.findAll();

        LocalDateTime now = LocalDateTime.now();

        for (Product p : products) {
            String cat = (p.getCategoryName() == null) ? "" : p.getCategoryName().toLowerCase();

            BigDecimal step = DECAY_STEP.getOrDefault(cat, new BigDecimal("0.03"));
            if (step.signum() <= 0) continue;

            // How long since last sale? (null => long time ago)
            LocalDateTime last = p.getLastSaleAt();
            long minutesSince = (last == null) ? 999_999L : Duration.between(last, now).toMinutes();

            if (minutesSince <= GRACE_MINUTES) continue; // still in grace window

            // Apply ONE step per scheduler tick (1 minute)
            BigDecimal oldPrice = p.getPrice();
            BigDecimal newPrice = oldPrice.subtract(step);

            // Clamp to minPrice
            if (newPrice.compareTo(p.getMinPrice()) < 0) {
                newPrice = p.getMinPrice();
            }

            // Only write if changed
            if (newPrice.compareTo(oldPrice) != 0) {
                p.setPrice(newPrice);

                priceHistoryRepo.save(PriceHistory.builder()
                        .product(p)
                        .oldPrice(oldPrice)
                        .newPrice(newPrice)
                        .changedAt(now)
                        .reason("Auto decay (no sales for " + minutesSince + " min)")
                        .build());

                productRepo.save(p);
            }
        }
    }
}
