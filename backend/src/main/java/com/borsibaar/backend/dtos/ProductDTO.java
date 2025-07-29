package com.borsibaar.backend.dtos;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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
    private Boolean    priceUp;
}