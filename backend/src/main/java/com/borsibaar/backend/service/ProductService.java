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

    private BigDecimal clampPrice(BigDecimal price) {
        BigDecimal min = BigDecimal.valueOf(4.00);
        BigDecimal max = BigDecimal.valueOf(9.00);
        if (price.compareTo(min) < 0) return min;
        if (price.compareTo(max) > 0) return max;
        return price;
    }

    public List<ProductDTO> findAll() {
        return productRepository.findAll().stream().map(product -> {
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
        }).toList();
    }

    @Transactional
    public ProductDTO save(CreateProductDto dto) {
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

        return ProductDTO.builder()
                .id(saved.getId())
                .name(saved.getName())
                .description(saved.getDescription())
                .price(saved.getPrice())
                .salesCount(saved.getSalesCount())
                .categoryId(saved.getCategoryId())
                .categoryName(saved.getCategoryName())
                .lastSaleAt(saved.getLastSaleAt())
                .build();
    }

    @Transactional
    public ProductDTO update(Long id, UpdateProductDto dto) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Category not found"
                ));

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setPrice(clampPrice(dto.getPrice()));
        existing.setCategory(category);

        Product updated = productRepository.save(existing);

        return ProductDTO.builder()
                .id(updated.getId())
                .name(updated.getName())
                .description(updated.getDescription())
                .price(updated.getPrice())
                .salesCount(updated.getSalesCount())
                .categoryId(updated.getCategoryId())
                .categoryName(updated.getCategoryName())
                .lastSaleAt(updated.getLastSaleAt())
                .build();
    }

    @Transactional
    public void delete(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(""));
        productRepository.delete(p);
    }


}
