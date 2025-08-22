// repository/PriceHistoryRepository.java
package com.borsibaar.backend.repository;

import com.borsibaar.backend.entity.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {
    Optional<PriceHistory> findTopByProductIdOrderByChangedAtDesc(Long productId);
    List<PriceHistory> findByProductIdOrderByChangedAtAsc(Long productId);
}
