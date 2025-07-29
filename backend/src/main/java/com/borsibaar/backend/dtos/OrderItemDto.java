package com.borsibaar.backend.dtos;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
public class OrderItemDto {
    private Long productId;
    private int quantity;
}
