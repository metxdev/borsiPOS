package com.borsibaar.backend.controller;

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

    private BigDecimal clampPrice(BigDecimal price) {
        BigDecimal min = BigDecimal.valueOf(4.00);
        BigDecimal max = BigDecimal.valueOf(9.00);
        if (price.compareTo(min) < 0) return min;
        if (price.compareTo(max) > 0) return max;
        return price;
    }

    public List<ProductDTO> findAll() {
        return productRepository.findAll().stream().map(this::buildDto).toList();
    }

    @Transactional
    public ProductDTO create(CreateProductDto dto) {
        productRepository.findByNameAndCategory_Id(dto.getName(), dto.getCategoryId())
                .ifPresent(p -> {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Product already exists in that category"
                    );
                });

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Category not found"
                ));

        Product product = Product.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(clampPrice(dto.getPrice()))
                .salesCount(0L)
                .lastSaleAt(null)
                .category(category)
                .build();

        Product saved = productRepository.save(product);
        return buildDto(saved);
    }

    @Transactional
    public ProductDTO update(Long id, UpdateProductDto dto) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        if (!existing.getName().equals(dto.getName()) || !existing.getCategoryId().equals(dto.getCategoryId())) {
            productRepository.findByNameAndCategory_Id(dto.getName(), dto.getCategoryId())
                    .filter(p -> !p.getId().equals(id))
                    .ifPresent(p -> {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Another product with that name and category already exists");
                    });
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Category not found"
                ));

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setPrice(clampPrice(dto.getPrice()));
        existing.setCategory(category);

        Product updated = productRepository.save(existing);
        return buildDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        productRepository.delete(p);
    }

    private ProductDTO buildDto(Product product) {
        ProductDTO.ProductDTOBuilder builder = ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .salesCount(product.getSalesCount())
                .categoryId(product.getCategoryId())
                .categoryName(product.getCategoryName())
                .lastSaleAt(product.getLastSaleAt());

        priceHistoryRepository.findTopByProductIdOrderByChangedAtDesc(product.getId())
                .ifPresent(hist -> {
                    builder.priceChange(hist.getNewPrice().subtract(hist.getOldPrice()));
                    builder.priceUp(hist.getNewPrice().compareTo(hist.getOldPrice()) > 0);
                });

        return builder.build();
    }
}
