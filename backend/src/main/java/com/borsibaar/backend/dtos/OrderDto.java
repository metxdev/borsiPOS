package com.borsibaar.backend.dtos;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class OrderDto {
    private Long id;
    private String createdAt;
    private double total;
    private List<OrderItemDto> items;
}
