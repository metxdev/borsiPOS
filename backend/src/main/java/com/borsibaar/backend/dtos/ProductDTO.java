package com.borsibaar.backend.dtos;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Long salesCount;
    private Long categoryId;
    private String categoryName;
    private LocalDateTime lastSaleAt;

    private BigDecimal priceChange;
    private Boolean priceUp;
    private BigDecimal predictedPrice;

}
