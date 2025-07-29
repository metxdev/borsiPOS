package com.borsibaar.backend.repository;


import com.borsibaar.backend.entity.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {
    Optional<PriceHistory> findTopByProductIdOrderByChangedAtDesc(Long productId);
}
