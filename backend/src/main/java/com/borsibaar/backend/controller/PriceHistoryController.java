package com.borsibaar.backend.controller;

import com.borsibaar.backend.dtos.PriceHistoryDto;
import com.borsibaar.backend.repository.PriceHistoryRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/price-history")
public class PriceHistoryController {

    private final PriceHistoryRepository repo;

    public PriceHistoryController(PriceHistoryRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/{productId}")
    public List<PriceHistoryDto> byProduct(@PathVariable Long productId) {
        return repo.findByProductIdOrderByChangedAtAsc(productId).stream()
                .map(h -> PriceHistoryDto.builder()
                        .changedAt(h.getChangedAt())
                        .oldPrice(h.getOldPrice())
                        .newPrice(h.getNewPrice())
                        .change(h.getNewPrice().subtract(h.getOldPrice()))
                        .reason(h.getReason())
                        .build())
                .toList();
    }
}
