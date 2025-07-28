package com.borsibaar.backend.dtos;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProductDto {
    private String name;
    private String description;
    private BigDecimal price;
    private Long categoryId;
}
