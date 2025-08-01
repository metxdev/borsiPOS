package com.borsibaar.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProductDto {
    private String name;
    private String description;
    private BigDecimal price;
    private Long categoryId;
}
