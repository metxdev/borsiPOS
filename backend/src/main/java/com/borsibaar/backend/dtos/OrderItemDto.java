package com.borsibaar.backend.dtos;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
@Data
public class OrderItemDto {
    private int quantity;
    private ProductDTO product;
}
