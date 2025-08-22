package com.borsibaar.backend.service;

import com.borsibaar.backend.dtos.CreateProductDto;
import com.borsibaar.backend.dtos.ProductDTO;
import com.borsibaar.backend.dtos.UpdateProductDto;
import com.borsibaar.backend.entity.Category;
import com.borsibaar.backend.entity.Product;
import com.borsibaar.backend.exceptions.ProductNotFoundException;
import com.borsibaar.backend.repository.CategoryRepository;
import com.borsibaar.backend.repository.PriceHistoryRepository;
import com.borsibaar.backend.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final PriceHistoryRepository priceHistoryRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          PriceHistoryRepository priceHistoryRepository) {
        this.categoryRepository = categoryRepository;
        this.priceHistoryRepository = priceHistoryRepository;
        this.productRepository = productRepository;
    }

    /* -------------------------- helpers -------------------------- */

    private BigDecimal clampPrice(BigDecimal price, BigDecimal min, BigDecimal max) {
        if (price.compareTo(min) < 0) return min;
        if (price.compareTo(max) > 0) return max;
        return price;
    }

    private boolean isCocktailOrShot(String name) {
        return name != null &&
                (name.equalsIgnoreCase("cocktails") || name.equalsIgnoreCase("shots"));
    }

    /** Exponential moving average of deltas (0 < alpha <= 1) */
    private BigDecimal ema(List<BigDecimal> values, BigDecimal alpha) {
        if (values == null || values.isEmpty()) return BigDecimal.ZERO;
        BigDecimal ema = values.get(0);
        for (int i = 1; i < values.size(); i++) {
            ema = values.get(i).multiply(alpha)
                    .add(ema.multiply(BigDecimal.ONE.subtract(alpha)));
        }
        return ema;
    }

    /* --------------------------- queries -------------------------- */

    public List<ProductDTO> findForUser(com.borsibaar.backend.entity.User user) {
        return productRepository.findByOwner_Id(user.getId())
                .stream()
                .map(this::buildDto)
                .toList();
    }

    /* --------------------------- commands ------------------------- */

    @Transactional
    public ProductDTO create(CreateProductDto dto, com.borsibaar.backend.entity.User principal) {
        productRepository.findByNameAndCategory_IdAndOwner_Id(dto.getName(), dto.getCategoryId(), principal.getId())
                .ifPresent(p -> { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product already exists in that category"); });

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        if (category.getOwner() != null && !category.getOwner().getId().equals(principal.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot create product in another user's category");
        }

        BigDecimal minPrice = BigDecimal.valueOf(4.00);
        BigDecimal maxPrice = BigDecimal.valueOf(9.00);
        BigDecimal clampedPrice = clampPrice(dto.getPrice(), minPrice, maxPrice);

        Product product = Product.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(clampedPrice)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .salesCount(0L)
                .lastSaleAt(null)
                .category(category)
                .owner(principal)
                .build();

        Product saved = productRepository.save(product);
        return buildDto(saved);
    }

    @Transactional
    public ProductDTO update(Long id, UpdateProductDto dto, com.borsibaar.backend.entity.User principal) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        if (existing.getOwner() == null || !existing.getOwner().getId().equals(principal.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot modify another user's product");
        }

        if (!existing.getName().equals(dto.getName()) || !existing.getCategoryId().equals(dto.getCategoryId())) {
            productRepository.findByNameAndCategory_IdAndOwner_Id(dto.getName(), dto.getCategoryId(), principal.getId())
                    .filter(p -> !p.getId().equals(id))
                    .ifPresent(p -> { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate product in category"); });
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        if (category.getOwner() != null && !category.getOwner().getId().equals(principal.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot move product to another user's category");
        }

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setPrice(clampPrice(dto.getPrice(), existing.getMinPrice(), existing.getMaxPrice()));
        existing.setCategory(category);

        Product updated = productRepository.save(existing);
        return buildDto(updated);
    }

    @Transactional
    public void delete(Long id, com.borsibaar.backend.entity.User principal) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        if (p.getOwner() == null || !p.getOwner().getId().equals(principal.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot delete another user's product");
        }

        productRepository.delete(p);
    }

    /* --------------------------- DTO builder ---------------------- */

    /** Exposed so controllers/services can reuse it. */
    public ProductDTO buildDto(Product product) {
        ProductDTO.ProductDTOBuilder builder = ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .salesCount(product.getSalesCount())
                .categoryId(product.getCategoryId())
                .categoryName(product.getCategoryName())
                .lastSaleAt(product.getLastSaleAt());

        // last change (nullable)
        priceHistoryRepository.findTopByProductIdOrderByChangedAtDesc(product.getId())
                .ifPresent(hist -> {
                    BigDecimal change = hist.getNewPrice().subtract(hist.getOldPrice());
                    builder.priceChange(change);
                    builder.priceUp(change.compareTo(BigDecimal.ZERO) > 0);
                });

        // --- Prediction ---
        // Try EMA of recent deltas; if none, apply category bias.
        var history = priceHistoryRepository.findByProductIdOrderByChangedAtAsc(product.getId());
        BigDecimal predicted = product.getPrice();
        if (!history.isEmpty()) {
            // Use up to the last 8 deltas for a snappier feel
            int from = Math.max(0, history.size() - 8);
            var recent = history.subList(from, history.size());
            var deltas = recent.stream()
                    .map(h -> h.getNewPrice().subtract(h.getOldPrice()))
                    .toList();
            BigDecimal alpha = new BigDecimal("0.55"); // responsive EMA
            BigDecimal drift = ema(deltas, alpha);
            predicted = product.getPrice().add(drift);
        } else {
            // Cold-start bias
            boolean hot = isCocktailOrShot(product.getCategoryName());
            BigDecimal pct = hot ? new BigDecimal("0.07") : new BigDecimal("-0.03");
            predicted = product.getPrice().multiply(BigDecimal.ONE.add(pct));
        }

        predicted = clampPrice(predicted, product.getMinPrice(), product.getMaxPrice());
        builder.predictedPrice(predicted);

        return builder.build();
    }
}
