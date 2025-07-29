package com.borsibaar.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "price_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PriceHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="product_id", nullable=false)
    private Product product;

    @Column(name="old_price", nullable=false, precision=10, scale=2)
    private BigDecimal oldPrice;

    @Column(name="new_price", nullable=false, precision=10, scale=2)
    private BigDecimal newPrice;

    @Column(name="changed_at", nullable=false)
    private LocalDateTime changedAt;
}