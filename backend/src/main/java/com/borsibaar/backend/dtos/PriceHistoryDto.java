package com.borsibaar.backend.dtos;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class PriceHistoryDto {
    private LocalDateTime changedAt;
    private BigDecimal oldPrice;
    private BigDecimal newPrice;
    private BigDecimal change;
    private String reason;
}
